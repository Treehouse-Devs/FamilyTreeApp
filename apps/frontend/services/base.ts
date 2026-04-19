import api from '@/lib/api'

const MOCK_DATA = process.env.EXPO_PUBLIC_MOCK_DATA === 'true'

export class BaseService {
  private static async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    payload?: object,
    config?: object,
  ): Promise<T> {
    if (MOCK_DATA) {
      const { mockApi } = await import('@/tests/index')

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
      const { mockApi } = await import('@/tests/index')

      return await mockApi(url, 'post') as T
    }

    const response = await api.request<T>({
      method: 'post',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  protected static async uploadImage<T>(
    endpoint: string,
    imageUri: string,
    defaultFilename: string = 'image.webp',
  ): Promise<T> {
    const formData = new FormData()

    // Extract filename from URI and change extension to .webp
    const originalFilename = imageUri.split('/').pop() || defaultFilename
    const filename = originalFilename.replace(/\.[^.]+$/, '.webp')

    // imageUri is expected to already be compressed to WebP by the caller
    // (e.g. via the useCompressImage hook) before passing here.
    const fileBlob = {
      uri: imageUri,
      type: 'image/webp',
      name: filename,
    }

    formData.append('image', fileBlob as unknown as Blob)

    return await this.postFormData<T>(endpoint, formData)
  }
}
