import { BoundedValueSerializer } from './bounded-value.serializer'

describe('BoundedValueSerializer', () => {
  const serializer = new BoundedValueSerializer()

  it('preserves JSON values that fit within the byte limit', () => {
    expect(serializer.serializeJson({ name: 'Ada' }, 256)).toEqual({
      value: { name: 'Ada' },
      kind: 'json',
      originalBytes: 14,
      capturedBytes: 14,
      truncated: false,
    })
  })

  it('marks circular references without failing serialization', () => {
    const value: { name: string, self?: unknown } = { name: 'Ada' }
    value.self = value

    expect(serializer.serializeJson(value, 256)).toEqual({
      value: { name: 'Ada', self: '[Circular]' },
      kind: 'json',
      originalBytes: 34,
      capturedBytes: 34,
      truncated: false,
    })
  })

  it('omits binary values while retaining their byte size', () => {
    expect(serializer.serializeJson(Buffer.from([1, 2, 3, 4]), 256)).toEqual({
      value: '[Binary omitted]',
      kind: 'binary',
      originalBytes: 4,
      capturedBytes: 0,
      truncated: false,
    })
  })

  it('truncates text on a valid UTF-8 boundary', () => {
    expect(serializer.serializeText('ééé', 5)).toEqual({
      value: 'éé',
      kind: 'text',
      originalBytes: 6,
      capturedBytes: 4,
      truncated: true,
    })
  })

  it('returns an explicit marker when a property getter throws', () => {
    const value = Object.defineProperty({}, 'secret', {
      enumerable: true,
      get: () => {
        throw new Error('cannot read property')
      },
    })

    expect(serializer.serializeJson(value, 256)).toEqual({
      value: '[Serialization failed]',
      kind: 'serialization-error',
      originalBytes: 0,
      capturedBytes: 0,
      truncated: false,
      serializationError: 'cannot read property',
    })
  })
})
