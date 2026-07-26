import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { useCompressImage } from './useCompressImage'

/**
 * Web/Capacitor replacement for the RN app's expo-image-picker usage in
 * `utils/person-detail.ts` and the settings screen.
 *
 * `@capacitor/camera` handles the permission prompt on native and falls back to a
 * file input in the browser, so the two paths share one call site. The result is
 * compressed to WebP before it reaches the upload endpoints, matching the RN flow.
 */
export function usePickImage() {
  const { compressImage } = useCompressImage()

  async function pickImage(source: CameraSource = CameraSource.Prompt): Promise<Blob | null> {
    const photo = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      // A URI keeps the full-size image out of the JS heap until we compress it.
      resultType: CameraResultType.Uri,
      source,
    })

    if (!photo.webPath) return null

    return compressImage(photo.webPath)
  }

  return { pickImage, CameraSource }
}
