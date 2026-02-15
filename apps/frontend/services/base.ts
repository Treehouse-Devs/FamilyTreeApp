import api from '@/lib/api'
import { mockApi } from '@/tests/index'

const MOCK_DATA = process.env.EXPO_PUBLIC_MOCK_DATA === 'true'

export class BaseService {
  private static async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    payload?: object,
    config?: object,
  ): Promise<T> {
    if (MOCK_DATA) {
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
}
