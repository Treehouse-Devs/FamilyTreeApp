import axios from 'axios'
import { useStore } from '@/store/store'

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://localhost:3000'
const TIMEOUT = 10000 // 10 seconds

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
})

const handleError = (error: unknown) => {
  return error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error))
}

api.interceptors.request.use(
  (config) => {
    const accessToken = useStore.getState().accessToken
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`

    return config
  },
  error => Promise.reject(handleError(error)),
)

api.interceptors.response.use(
  response => response,
  (error) => {
    // handle global error messages here
    return Promise.reject(handleError(error))
  },
)

export default api
