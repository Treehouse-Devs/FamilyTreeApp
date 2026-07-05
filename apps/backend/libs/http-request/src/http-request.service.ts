import { Injectable } from '@nestjs/common'
import axios, { AxiosError, AxiosResponse } from 'axios'

@Injectable()
export class HttpRequestService {
  async sendPostRequest<T = unknown>(url: string, data: T): Promise<AxiosResponse> {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })

      return response
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw error.response?.data
      } else {
        throw error
      }
    }
  }
}
