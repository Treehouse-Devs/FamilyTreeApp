import api from '@/lib/api'

const MOCK_DATA = import.meta.env.VITE_MOCK_DATA === 'true'

/**
 * Ported from the RN app's `services/base.ts`.
 *
 * The one behavioural change is `uploadImage`: React Native accepts a
 * `{ uri, type, name }` pseudo-Blob in FormData, which browsers do not. On the
 * web the caller hands us a real `Blob` (produced by `useCompressImage`), so we
 * append that directly.
 */
export class BaseService {
  private static async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    payload?: object,
    config?: object,
  ): Promise<T> {
    if (MOCK_DATA) {
      const { mockApi } = await import('@/mocks/index')

      return await mockApi(url, method) as T
    }

    const response = await api.request<T>({
      method,
      url,
      ...(payload && ['post', 'put', 'patch'].includes(method)
        ? { data: payload }
        : { params: payload }),
      ...config,
    })

    return response.data
  }

  protected static async get<T>(url: string, params?: object) {
    return this.request<T>('get', url, { params })
  }

  protected static async post<T>(url: string, data?: object) {
    return this.request<T>('post', url, data)
  }

  protected static async put<T>(url: string, data?: object) {
    return this.request<T>('put', url, data)
  }

  protected static async patch<T>(url: string, data?: object) {
    return this.request<T>('patch', url, data)
  }

  protected static async delete<T>(url: string) {
    return this.request<T>('delete', url)
  }

  protected static async postFormData<T>(url: string, formData: FormData) {
    if (MOCK_DATA) {
      const { mockApi } = await import('@/mocks/index')

      return await mockApi(url, 'post') as T
    }

    const response = await api.request<T>({
      method: 'post',
      url,
      data: formData,
      // Left unset on purpose: the browser has to add the multipart boundary
      // itself, which it only does when Content-Type is absent.
      headers: { 'Content-Type': undefined },
    })

    return response.data
  }

  /**
   * Uploads an already-compressed WebP blob (see `composables/useCompressImage`).
   */
  protected static async uploadImage<T>(
    endpoint: string,
    image: Blob,
    defaultFilename: string = 'image.webp',
  ): Promise<T> {
    const formData = new FormData()

    const filename = image instanceof File
      ? image.name.replace(/\.[^.]+$/, '.webp')
      : defaultFilename

    formData.append('image', image, filename)

    return await this.postFormData<T>(endpoint, formData)
  }
}
