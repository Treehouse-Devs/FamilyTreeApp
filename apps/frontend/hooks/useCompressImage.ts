import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { useCallback } from 'react'

const COMPRESS_QUALITY = 0.85

/**
 * Returns a stable `compressImage(uri)` async function that converts any image
 * to WebP at 85% quality using the static `ImageManipulator.manipulate` API.
 *
 * Usage:
 *   const { compressImage } = useCompressImage()
 *   const compressedUri = await compressImage(rawUri)
 */
export const useCompressImage = () => {
  const compressImage = useCallback(async (imageUri: string): Promise<string> => {
    const image = ImageManipulator.manipulate(imageUri)
    const rendered = await image.renderAsync()
    const saved = await rendered.saveAsync({
      compress: COMPRESS_QUALITY,
      format: SaveFormat.WEBP,
    })

    return saved.uri
  }, [])

  return { compressImage }
}
