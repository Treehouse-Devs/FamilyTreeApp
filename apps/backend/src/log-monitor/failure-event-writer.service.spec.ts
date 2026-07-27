import { FailureEventWriter } from './failure-event-writer.service'
import type { FailureEvent } from './failure-event.types'
import { FAILURE_EVENT_MAX_BYTES } from './log-monitor.constants'

function eventWithLargeValues(): FailureEvent {
  const body = {
    value: 'x'.repeat(600 * 1024),
    kind: 'text' as const,
    originalBytes: 600 * 1024,
    capturedBytes: 600 * 1024,
    truncated: false,
  }

  return {
    event: 'http_failure',
    schemaVersion: 1,
    timestamp: '2026-07-16T00:00:00.000Z',
    environment: 'staging',
    service: 'backend',
    requestId: 'large-event',
    durationMs: 1,
    request: {
      method: 'POST',
      path: '/failure',
      routeParams: {},
      query: {},
      ip: '127.0.0.1',
      userAgent: 'test',
      headers: {},
      authenticatedUser: { email: 'x'.repeat(1024 * 1024) },
      body,
      files: [],
    },
    response: {
      statusCode: 500,
      headers: {},
      body,
    },
    exception: {
      name: 'Error',
      message: 'x'.repeat(1024 * 1024),
    },
  }
}

describe('FailureEventWriter', () => {
  it('guarantees that a compacted event fits within the Loki line limit', () => {
    const lines: string[] = []
    const writer = new FailureEventWriter({ write: line => lines.push(line) })

    writer.write(eventWithLargeValues())

    expect(lines).toHaveLength(1)
    expect(Buffer.byteLength(lines[0])).toBeLessThanOrEqual(FAILURE_EVENT_MAX_BYTES)
    const event = JSON.parse(lines[0]) as FailureEvent
    expect(event.request.authenticatedUser).toBeUndefined()
    expect(event.request.body.value).toContain('Omitted because escaped bodies')
    expect(event.capture).toMatchObject({ eventTruncated: true })
  })

  it('preserves bounded bodies when oversized metadata causes compaction', () => {
    const lines: string[] = []
    const event = eventWithLargeValues()
    event.request.body = {
      value: { request: 'kept' },
      kind: 'json',
      originalBytes: 18,
      capturedBytes: 18,
      truncated: false,
    }
    event.response.body = {
      value: { response: 'kept' },
      kind: 'json',
      originalBytes: 19,
      capturedBytes: 19,
      truncated: false,
    }
    const writer = new FailureEventWriter({ write: line => lines.push(line) })

    writer.write(event)

    const written = JSON.parse(lines[0]) as FailureEvent
    expect(written.request.body.value).toEqual({ request: 'kept' })
    expect(written.response.body.value).toEqual({ response: 'kept' })
    expect(written.capture).toMatchObject({ eventTruncated: true })
  })

  it('attempts a minimal stderr fallback when the configured sink fails', () => {
    const stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)
    const writer = new FailureEventWriter({
      write: () => {
        throw new Error('stdout unavailable')
      },
    })

    expect(() => writer.write(eventWithLargeValues())).not.toThrow()
    expect(stderr).toHaveBeenCalledWith('{"event":"http_failure_capture_error"}\n')

    stderr.mockRestore()
  })
})
