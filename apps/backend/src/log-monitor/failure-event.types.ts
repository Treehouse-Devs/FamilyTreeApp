import type { CapturedValue } from './bounded-value.serializer'

export interface UploadedFileMetadata {
  fieldName: string
  originalName: string
  mimeType: string
  size: number
}

export interface FailureExceptionDetails {
  name: string
  message: string
  stack?: CapturedValue
}

export interface FailureEvent {
  event: 'http_failure'
  schemaVersion: 1
  timestamp: string
  environment: string
  service: 'backend'
  requestId: string
  durationMs: number
  request: {
    method: string
    path: string
    routeParams: Record<string, string>
    query: Record<string, unknown>
    ip: string
    userAgent: string
    headers: Record<string, string | string[] | undefined>
    authenticatedUser?: Record<string, string>
    body: CapturedValue
    files: UploadedFileMetadata[]
  }
  response: {
    statusCode: number
    headers: Record<string, string | number | string[] | undefined>
    body: CapturedValue
  }
  exception?: FailureExceptionDetails
  capture?: {
    eventTruncated: true
    originalBytes: number
  }
}
