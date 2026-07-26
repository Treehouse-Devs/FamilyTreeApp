const COMPRESS_QUALITY = 0.85
const MAX_DIMENSION = 1024

/**
 * Web replacement for the RN app's `hooks/useCompressImage.ts`, which uses
 * expo-image-manipulator to convert to WebP at 85% quality. Canvas gives the same
 * result in the browser and inside the Capacitor webview.
 *
 * Returns a real `Blob` — the RN version returns a file URI, which is why
 * `BaseService.uploadImage` also had to change.
 */
export function useCompressImage() {
  async function compressImage(source: Blob | string): Promise<Blob> {
    const bitmap = await loadBitmap(source)

    // Preserve aspect ratio while capping the longest edge.
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not acquire a 2D canvas context')
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/webp', COMPRESS_QUALITY),
    )
    if (!blob) throw new Error('Image compression produced no output')

    return blob
  }

  return { compressImage }
}

async function loadBitmap(source: Blob | string): Promise<ImageBitmap> {
  if (typeof source !== 'string') return createImageBitmap(source)

  const response = await fetch(source)

  return createImageBitmap(await response.blob())
}
