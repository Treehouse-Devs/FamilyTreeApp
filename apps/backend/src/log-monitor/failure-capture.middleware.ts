import { Inject, Injectable } from '@nestjs/common'
import type { NestMiddleware } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import { StringDecoder } from 'node:string_decoder'
import { BoundedValueSerializer } from './bounded-value.serializer'
import { FailureEventWriter } from './failure-event-writer.service'
import type { FailureEvent, UploadedFileMetadata } from './failure-event.types'
import { FailureRequestContextStore } from './failure-request-context.store'
import type { FailureRequestContext } from './failure-request-context.store'
import { CAPTURED_BODY_MAX_BYTES, LOG_MONITOR_ENABLED, LOG_MONITOR_ENVIRONMENT, REQUEST_ID_HEADER } from './log-monitor.constants'
import type { BoundedBodyCapture } from './bounded-body-capture'

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/
const JSON_CONTENT_TYPE = /^application\/(?:[a-z0-9.+-]*\+)?json(?:;|$)/i
const TEXT_CONTENT_TYPE = /^(?:text\/[a-z0-9.+-]+|application\/(?:xml|x-www-form-urlencoded))(?:;|$)/i

interface RequestWithUploads extends Request {
  file?: Express.Multer.File
  files?: Express.Multer.File[] | Record<string, Express.Multer.File[]>
}

function requestIdFrom(request: Request): string {
  const candidate = request.get(REQUEST_ID_HEADER)

  return candidate && SAFE_REQUEST_ID.test(candidate) ? candidate : randomUUID()
}

function isCapturableBodyContentType(contentType: string): boolean {
  return JSON_CONTENT_TYPE.test(contentType) || TEXT_CONTENT_TYPE.test(contentType)
}

function shouldCaptureRequestBody(request: Request): boolean {
  return isCapturableBodyContentType(request.get('content-type') ?? '')
}

function fileMetadata(file: Express.Multer.File): UploadedFileMetadata {
  return {
    fieldName: file.fieldname,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  }
}

function uploadedFiles(request: RequestWithUploads): UploadedFileMetadata[] {
  if (request.file) {
    return [fileMetadata(request.file)]
  }
  if (Array.isArray(request.files)) {
    return request.files.map(fileMetadata)
  }
  if (request.files) {
    return Object.values(request.files).flat().map(fileMetadata)
  }

  return []
}

function authenticatedUser(request: Request): Record<string, string> | undefined {
  if (!request.user || typeof request.user !== 'object') {
    return undefined
  }

  const user = request.user as Record<string, unknown>
  const identity: Record<string, string> = {}
  for (const key of ['uid', 'email']) {
    const value = user[key]
    if (typeof value === 'string') {
      identity[key] = value
    }
  }

  return Object.keys(identity).length > 0 ? identity : undefined
}

function capturedBufferedBody(
  capture: BoundedBodyCapture,
  contentType: string,
  serializer: BoundedValueSerializer,
) {
  const bytes = capture.bytes
  const originalBytes = capture.originalBytes

  if (originalBytes === 0) {
    return serializer.serializeJson(undefined, CAPTURED_BODY_MAX_BYTES)
  }
  if (!isCapturableBodyContentType(contentType)) {
    return {
      value: '[Binary omitted]',
      kind: 'binary' as const,
      originalBytes,
      capturedBytes: 0,
      truncated: false,
    }
  }

  const decoder = new StringDecoder('utf8')
  const value = decoder.write(bytes)
  const capturedBytes = Buffer.byteLength(value)
  const truncated = originalBytes > capturedBytes
  if (JSON_CONTENT_TYPE.test(contentType) && !truncated) {
    try {
      return {
        value: JSON.parse(value) as unknown,
        kind: 'json' as const,
        originalBytes,
        capturedBytes,
        truncated: false,
      }
    } catch {
      // Fall through to text when a response declares JSON but is not valid JSON.
    }
  }

  return {
    value,
    kind: 'text' as const,
    originalBytes,
    capturedBytes,
    truncated,
  }
}

function capturedRequestBody(
  request: RequestWithUploads,
  context: FailureRequestContext,
  serializer: BoundedValueSerializer,
) {
  if (request.body !== undefined) {
    return serializer.serializeJson(request.body, CAPTURED_BODY_MAX_BYTES)
  }

  return capturedBufferedBody(context.requestBody, request.get('content-type') ?? '', serializer)
}

function capturedResponseBody(
  context: FailureRequestContext,
  response: Response,
  serializer: BoundedValueSerializer,
) {
  const contentType = response.getHeader('content-type')

  return capturedBufferedBody(
    context.responseBody,
    typeof contentType === 'string' ? contentType : '',
    serializer,
  )
}

function patchResponse(response: Response, context: FailureRequestContext): void {
  const originalWrite = response.write
  const originalEnd = response.end

  response.write = ((...args: unknown[]) => {
    context.responseBody.append(args[0], args[1])

    return Reflect.apply(originalWrite, response, args) as boolean
  }) as Response['write']

  response.end = ((...args: unknown[]) => {
    context.responseBody.append(args[0], args[1])

    return Reflect.apply(originalEnd, response, args) as Response
  }) as Response['end']
}

@Injectable()
export class FailureCaptureMiddleware implements NestMiddleware {
  constructor(
    @Inject(LOG_MONITOR_ENABLED) private readonly enabled: boolean,
    @Inject(LOG_MONITOR_ENVIRONMENT) private readonly environment: string,
    private readonly contexts: FailureRequestContextStore,
    private readonly serializer: BoundedValueSerializer,
    private readonly writer: FailureEventWriter,
  ) { }

  use(request: RequestWithUploads, response: Response, next: NextFunction): void {
    if (!this.enabled) {
      next()

      return
    }

    const requestId = requestIdFrom(request)
    response.setHeader(REQUEST_ID_HEADER, requestId)
    const context = this.contexts.create(request, requestId)
    if (shouldCaptureRequestBody(request)) {
      request.on('data', chunk => context.requestBody.append(chunk))
    }
    patchResponse(response, context)

    response.once('finish', () => {
      try {
        if (response.statusCode >= 400 && response.statusCode <= 599) {
          this.writer.write(this.buildEvent(request, response, context))
        }
      } finally {
        this.contexts.delete(request)
      }
    })
    response.once('close', () => {
      if (!response.writableFinished) {
        this.contexts.delete(request)
      }
    })

    next()
  }

  private buildEvent(request: RequestWithUploads, response: Response, context: FailureRequestContext): FailureEvent {
    return {
      event: 'http_failure',
      schemaVersion: 1,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      service: 'backend',
      requestId: context.requestId,
      durationMs: Date.now() - context.startedAt,
      request: {
        method: request.method,
        path: request.originalUrl,
        routeParams: { ...request.params },
        query: { ...request.query },
        ip: request.ip ?? '',
        userAgent: request.get('user-agent') ?? '',
        headers: { ...request.headers },
        authenticatedUser: authenticatedUser(request),
        body: capturedRequestBody(request, context, this.serializer),
        files: uploadedFiles(request),
      },
      response: {
        statusCode: response.statusCode,
        headers: { ...response.getHeaders() },
        body: capturedResponseBody(context, response, this.serializer),
      },
      exception: context.exception,
    }
  }
}
