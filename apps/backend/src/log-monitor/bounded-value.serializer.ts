import { Injectable } from '@nestjs/common'

export type CapturedValueKind = 'json' | 'text' | 'binary' | 'empty' | 'serialization-error'

export interface CapturedValue {
  value: unknown
  kind: CapturedValueKind
  originalBytes: number
  capturedBytes: number
  truncated: boolean
  serializationError?: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function truncateUtf8(value: string, maxBytes: number): { value: string, bytes: number } {
  const buffer = Buffer.from(value)
  if (buffer.length <= maxBytes) {
    return { value, bytes: buffer.length }
  }

  let end = maxBytes
  while (end > 0 && (buffer[end] & 0xC0) === 0x80) {
    end -= 1
  }

  return {
    value: buffer.subarray(0, end).toString('utf8'),
    bytes: end,
  }
}

@Injectable()
export class BoundedValueSerializer {
  serializeJson(value: unknown, maxBytes: number): CapturedValue {
    if (value === undefined) {
      return {
        value: null,
        kind: 'empty',
        originalBytes: 0,
        capturedBytes: 0,
        truncated: false,
      }
    }

    if (Buffer.isBuffer(value)) {
      return {
        value: '[Binary omitted]',
        kind: 'binary',
        originalBytes: value.length,
        capturedBytes: 0,
        truncated: false,
      }
    }

    try {
      const seen = new WeakSet<object>()
      const serialized = JSON.stringify(value, function (key, currentValue: unknown) {
        const sourceValue = key === '' ? value : (this as Record<string, unknown>)[key]
        if (Buffer.isBuffer(sourceValue)) {
          return `[Binary omitted: ${sourceValue.length} bytes]`
        }

        if (typeof currentValue === 'object' && currentValue !== null) {
          if (seen.has(currentValue)) {
            return '[Circular]'
          }
          seen.add(currentValue)
        }

        return currentValue
      })

      if (serialized === undefined) {
        return {
          value: null,
          kind: 'empty',
          originalBytes: 0,
          capturedBytes: 0,
          truncated: false,
        }
      }

      const originalBytes = Buffer.byteLength(serialized)
      const captured = truncateUtf8(serialized, maxBytes)

      return {
        value: originalBytes > maxBytes ? captured.value : JSON.parse(serialized) as unknown,
        kind: 'json',
        originalBytes,
        capturedBytes: captured.bytes,
        truncated: originalBytes > maxBytes,
      }
    } catch (error) {
      return {
        value: '[Serialization failed]',
        kind: 'serialization-error',
        originalBytes: 0,
        capturedBytes: 0,
        truncated: false,
        serializationError: errorMessage(error),
      }
    }
  }

  serializeText(value: string, maxBytes: number): CapturedValue {
    const originalBytes = Buffer.byteLength(value)
    const captured = truncateUtf8(value, maxBytes)

    return {
      value: captured.value,
      kind: 'text',
      originalBytes,
      capturedBytes: captured.bytes,
      truncated: originalBytes > maxBytes,
    }
  }
}
