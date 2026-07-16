import { Inject, Injectable } from '@nestjs/common'
import { FAILURE_EVENT_MAX_BYTES, FAILURE_EVENT_SINK } from './log-monitor.constants'
import type { FailureEvent } from './failure-event.types'

export interface FailureEventSink {
  write(line: string): void
}

@Injectable()
export class StdoutFailureEventSink implements FailureEventSink {
  write(line: string): void {
    process.stdout.write(`${line}\n`)
  }
}

function compactMetadata(event: FailureEvent, originalBytes: number): FailureEvent {
  return {
    ...event,
    request: {
      ...event.request,
      path: event.request.path.slice(0, 4096),
      ip: event.request.ip.slice(0, 256),
      userAgent: event.request.userAgent.slice(0, 4096),
      headers: {},
      routeParams: {},
      query: {},
      authenticatedUser: undefined,
      files: [],
    },
    response: {
      ...event.response,
      headers: {},
    },
    exception: event.exception
      ? {
          name: event.exception.name.slice(0, 256),
          message: event.exception.message.slice(0, 8192),
        }
      : undefined,
    capture: {
      eventTruncated: true,
      originalBytes,
    },
  }
}

function omitBodies(event: FailureEvent): FailureEvent {
  return {
    ...event,
    request: {
      ...event.request,
      body: {
        value: '[Omitted because escaped bodies exceeded the 1 MiB event limit]',
        kind: 'text',
        originalBytes: event.request.body.originalBytes,
        capturedBytes: 0,
        truncated: true,
      },
    },
    response: {
      ...event.response,
      body: {
        value: '[Omitted because escaped bodies exceeded the 1 MiB event limit]',
        kind: 'text',
        originalBytes: event.response.body.originalBytes,
        capturedBytes: 0,
        truncated: true,
      },
    },
  }
}

@Injectable()
export class FailureEventWriter {
  constructor(@Inject(FAILURE_EVENT_SINK) private readonly sink: FailureEventSink) { }

  write(event: FailureEvent): void {
    try {
      let line = JSON.stringify(event)
      const originalBytes = Buffer.byteLength(line)
      if (originalBytes > FAILURE_EVENT_MAX_BYTES) {
        const compacted = compactMetadata(event, originalBytes)
        line = JSON.stringify(compacted)
        if (Buffer.byteLength(line) > FAILURE_EVENT_MAX_BYTES) {
          line = JSON.stringify(omitBodies(compacted))
        }
      }
      this.sink.write(line)
    } catch {
      try {
        process.stderr.write('{"event":"http_failure_capture_error"}\n')
      } catch {
        // Failure monitoring must never change the request being observed.
      }
    }
  }
}
