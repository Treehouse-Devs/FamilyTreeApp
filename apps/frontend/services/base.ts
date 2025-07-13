import api from '@/lib/api'
import { useMockDevToolStore } from '../store/mockDevToolStore'
import { RequestLog, HttpMethod } from '../types/mockDevTool'
import { MockApi } from '../tests'

let MOCK_DATA = process.env.EXPO_PUBLIC_MOCK_DATA === 'true'
const ENABLE_DEVTOOLS = process.env.EXPO_PUBLIC_ENABLE_DEVTOOLS === 'true'

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export class BaseService {
  private static async request<T>(
    method: HttpMethod,
    url: string,
    payload?: object,
    config?: object,
  ): Promise<T> {
    const requestId = generateRequestId()
    const startTime = Date.now()

    // Log request start if devtools enabled
    if (ENABLE_DEVTOOLS) {
      console.log(`[MockDevTool] ${method.toUpperCase()} ${url}`, payload)
      const { mockMode } = useMockDevToolStore.getState()
      MOCK_DATA = mockMode ?? process.env.EXPO_PUBLIC_MOCK_DATA === 'true'
    }

    try {
      let response: T

      if (MOCK_DATA) {
        // Check if we should use enhanced mock API
        const store = useMockDevToolStore.getState()
        const hasCustomConfigs = store.mockConfigurations.find(
          config => config.enabled && config.endpoint === url.replace(/^\//, ''),
        )
        if (hasCustomConfigs) {
          response = await MockApi.handleRequest(url, method, payload) as T
        }
        else {
          throw new Error(
            `Mock data is enabled, but no matching mock configuration found for ${method.toUpperCase()} ${url}. Please check your mock configurations.`,
          )
        }

        return response
      }
      else {
        const apiResponse = await api.request<T>({
          method,
          url,
          ...(payload && ['post', 'put', 'patch'].includes(method)
            ? { data: payload }
            : { params: payload }),
          ...config,
        })
        response = apiResponse.data
      }

      // Log successful request
      if (ENABLE_DEVTOOLS) {
        const requestLog: RequestLog = {
          id: requestId,
          timestamp: new Date(),
          method,
          url,
          requestData: payload || null,
          responseData: response,
          responseTime: Date.now() - startTime,
          statusCode: 200,
          isMocked: MOCK_DATA,
        }
        useMockDevToolStore.getState().addRequestLog(requestLog)
        console.log(`[MockDevTool] ${method.toUpperCase()} ${url} completed in ${Date.now() - startTime}ms`, response)
      }

      return response
    }
    catch (error) {
      // Log failed request
      if (ENABLE_DEVTOOLS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const errorObj = error as any
        const requestLog: RequestLog = {
          id: requestId,
          timestamp: new Date(),
          method,
          url,
          requestData: payload || null,
          responseData: null,
          responseTime: Date.now() - startTime,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          statusCode: errorObj?.status || errorObj?.response?.status || 500,
          isMocked: MOCK_DATA,
          error: error as Error,
        }
        useMockDevToolStore.getState().addRequestLog(requestLog)
      }

      throw error
    }
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
}
