import { CAPTURED_BODY_MAX_BYTES } from './log-monitor.constants'

function toBuffer(value: unknown, encoding: unknown): Buffer | undefined {
  if (Buffer.isBuffer(value)) {
    return value
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value)
  }
  if (typeof value === 'string') {
    return Buffer.from(value, typeof encoding === 'string' ? encoding as BufferEncoding : 'utf8')
  }

  return undefined
}

export class BoundedBodyCapture {
  private readonly chunks: Buffer[] = []
  private retainedBytes = 0
  private totalBytes = 0

  append(value: unknown, encoding?: unknown): void {
    const chunk = toBuffer(value, encoding)
    if (!chunk) {
      return
    }

    this.totalBytes += chunk.length
    const remaining = CAPTURED_BODY_MAX_BYTES - this.retainedBytes
    if (remaining <= 0) {
      return
    }

    const retained = chunk.subarray(0, remaining)
    this.chunks.push(retained)
    this.retainedBytes += retained.length
  }

  get bytes(): Buffer {
    return Buffer.concat(this.chunks, this.retainedBytes)
  }

  get originalBytes(): number {
    return this.totalBytes
  }
}
