import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import type { CanActivate } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'
import type { Response } from 'express'
import { Test } from '@nestjs/testing'
import { FileInterceptor } from '@nestjs/platform-express'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import request from 'supertest'
import type { App } from 'supertest/types'
import type { FailureEvent } from './failure-event.types'
import { CAPTURED_BODY_MAX_BYTES, FAILURE_EVENT_SINK, LOG_MONITOR_ENABLED } from './log-monitor.constants'
import type { FailureEventSink } from './failure-event-writer.service'
import { LogMonitorModule } from './log-monitor.module'
import { FailureCaptureMiddleware } from './failure-capture.middleware'

@Injectable()
class DelayedGuard implements CanActivate {
  async canActivate(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 25))

    return true
  }
}

@Controller('capture')
class CaptureTestController {
  @Post('bad-request')
  failValidation(@Body() _body: unknown): never {
    throw new BadRequestException('invalid family member')
  }

  @Post('text-failure')
  failText(@Body() _body: string): never {
    throw new BadRequestException('invalid text payload')
  }

  @Get('success')
  success() {
    return { ok: true }
  }

  @Get('manual-failure')
  manualFailure(@Res() response: Response): void {
    response.status(418).json({ message: 'teapot' })
  }

  @Get('unexpected-error')
  unexpectedError(): never {
    throw new Error('database unavailable')
  }

  @Post('multipart')
  @UseGuards(DelayedGuard)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }
  }
}

@Module({
  imports: [LogMonitorModule],
  controllers: [CaptureTestController],
  providers: [DelayedGuard],
})
class CaptureTestModule { }

async function createCaptureApp(enabled: boolean, sink: FailureEventSink): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    imports: [CaptureTestModule],
  })
    .overrideProvider(LOG_MONITOR_ENABLED)
    .useValue(enabled)
    .overrideProvider(FAILURE_EVENT_SINK)
    .useValue(sink)
    .compile()

  const application = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
    logger: false,
  })
  const failureCapture = application.get(FailureCaptureMiddleware)
  application.use(failureCapture.use.bind(failureCapture))
  application.useBodyParser('json')
  application.useBodyParser('urlencoded', { extended: true })
  await application.init()

  return application
}

describe('HTTP failure capture', () => {
  let app: INestApplication<App>
  let lines: string[]

  beforeEach(async () => {
    lines = []
    const sink: FailureEventSink = {
      write: (line: string) => {
        lines.push(line)
      },
    }
    app = await createCaptureApp(true, sink)
  })

  afterEach(async () => {
    await app.close()
  })

  it('captures one complete event without changing a failed response', async () => {
    const response = await request(app.getHttpServer())
      .post('/capture/bad-request?source=frontend')
      .set('x-request-id', 'frontend-debug-42')
      .set('authorization', 'Bearer staging-token')
      .send({ firstName: 'Rina', password: 'unredacted' })
      .expect(400)
      .expect('x-request-id', 'frontend-debug-42')

    expect(response.body).toEqual({
      message: 'invalid family member',
      error: 'Bad Request',
      statusCode: 400,
    })
    expect(lines).toHaveLength(1)

    const event = JSON.parse(lines[0]) as FailureEvent
    expect(event).toMatchObject({
      event: 'http_failure',
      schemaVersion: 1,
      requestId: 'frontend-debug-42',
      request: {
        method: 'POST',
        path: '/capture/bad-request?source=frontend',
        query: { source: 'frontend' },
        headers: { authorization: 'Bearer staging-token' },
        body: { value: { firstName: 'Rina', password: 'unredacted' } },
      },
      response: {
        statusCode: 400,
        body: {
          value: {
            message: 'invalid family member',
            error: 'Bad Request',
            statusCode: 400,
          },
        },
      },
      exception: {
        name: 'BadRequestException',
        message: 'invalid family member',
      },
    })
    expect(event.durationMs).toEqual(expect.any(Number))
    expect(event.timestamp).toEqual(expect.any(String))
  })

  it('captures a text request body', async () => {
    await request(app.getHttpServer())
      .post('/capture/text-failure')
      .set('content-type', 'text/plain')
      .send('frontend text payload')
      .expect(400)

    const event = JSON.parse(lines[0]) as FailureEvent
    expect(event.request.body).toMatchObject({
      value: 'frontend text payload',
      kind: 'text',
      truncated: false,
    })
  })

  it('captures malformed JSON rejected by the body parser', async () => {
    await request(app.getHttpServer())
      .post('/capture/bad-request')
      .set('content-type', 'application/json')
      .send('{"broken"')
      .expect(400)

    expect(lines).toHaveLength(1)
    const event = JSON.parse(lines[0]) as FailureEvent
    expect(event.response.statusCode).toBe(400)
    expect(event.request.body).toMatchObject({
      value: '{"broken"',
      kind: 'text',
      originalBytes: 9,
      capturedBytes: 9,
      truncated: false,
    })
  })

  it('captures oversized JSON rejected by the default body parser', async () => {
    const payload = JSON.stringify('x'.repeat(CAPTURED_BODY_MAX_BYTES))

    await request(app.getHttpServer())
      .post('/capture/bad-request')
      .set('content-type', 'application/json')
      .send(payload)
      .expect(413)

    expect(lines).toHaveLength(1)
    const event = JSON.parse(lines[0]) as FailureEvent
    expect(event.response.statusCode).toBe(413)
    expect(event.request.body).toMatchObject({
      kind: 'text',
      originalBytes: Buffer.byteLength(payload),
      capturedBytes: CAPTURED_BODY_MAX_BYTES,
      truncated: true,
    })
  })

  it('does not consume multipart uploads before an asynchronous guard and Multer', async () => {
    const pngFixture = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )

    const response = await request(app.getHttpServer())
      .post('/capture/multipart')
      .attach('image', pngFixture, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(201)

    expect(response.body).toEqual({
      originalName: 'avatar.png',
      mimeType: 'image/png',
      size: pngFixture.length,
    })
    expect(lines).toHaveLength(0)
  })

  it('does not capture successful responses and replaces unsafe request IDs', async () => {
    const response = await request(app.getHttpServer())
      .get('/capture/success')
      .set('x-request-id', 'unsafe request id')
      .expect(200)

    expect(response.body).toEqual({ ok: true })
    expect(response.get('x-request-id')).toMatch(/^[0-9a-f-]{36}$/)
    expect(lines).toHaveLength(0)
  })

  it('does not patch responses or emit events when capture is disabled', async () => {
    await app.close()
    app = await createCaptureApp(false, { write: line => lines.push(line) })

    const response = await request(app.getHttpServer())
      .get('/capture/manual-failure')
      .expect(418)

    expect(response.body).toEqual({ message: 'teapot' })
    expect(response.get('x-request-id')).toBeUndefined()
    expect(lines).toHaveLength(0)
  })

  it('captures a manually written failure response without an exception', async () => {
    const response = await request(app.getHttpServer())
      .get('/capture/manual-failure')
      .expect(418)

    expect(response.body).toEqual({ message: 'teapot' })
    expect(lines).toHaveLength(1)
    const event = JSON.parse(lines[0]) as FailureEvent
    expect(event.response).toMatchObject({
      statusCode: 418,
      body: { value: { message: 'teapot' } },
    })
    expect(event.exception).toBeUndefined()
  })

  it('captures exception details while preserving Nest internal-error output', async () => {
    const response = await request(app.getHttpServer())
      .get('/capture/unexpected-error')
      .expect(500)

    expect(response.body).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    expect(lines).toHaveLength(1)
    const event = JSON.parse(lines[0]) as FailureEvent
    expect(event.response.body.value).toEqual({
      statusCode: 500,
      message: 'Internal server error',
    })
    expect(event.exception).toMatchObject({
      name: 'Error',
      message: 'database unavailable',
      stack: { truncated: false },
    })
  })
})
