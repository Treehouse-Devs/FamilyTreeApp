import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { router } from 'expo-router'
import { useStore } from '@/store/store'

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://localhost:3000'
const TIMEOUT = 10000 // 10 seconds

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
})

// A separate, interceptor-free client used only to call the refresh endpoint.
// This avoids the response interceptor below recursing into itself when the
// refresh request is the thing that fails.
const refreshClient = axios.create({
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

// Holds the in-flight refresh request so that multiple concurrent 401s trigger
// only a single call to /auth/refresh-token (single-flight). Every request that
// hits a 401 while a refresh is running awaits this same promise.
let refreshPromise: Promise<string | null> | null = null

async function performTokenRefresh(): Promise<string | null> {
  const { user, refreshToken, setTokens } = useStore.getState()
  const uid = (user as { uid?: string } | null)?.uid

  // Without a uid + refresh token there is nothing to refresh with.
  if (!uid || !refreshToken) return null

  const { data } = await refreshClient.post<{ accessToken: string, expiredAt?: number }>(
    '/auth/refresh-token',
    { uid, refreshToken },
  )

  // The backend does not rotate the refresh token on refresh, so we keep the
  // existing one and only swap in the new access token + expiry.
  setTokens({
    accessToken: data.accessToken,
    refreshToken,
    expiredAt: data.expiredAt ?? null,
  })

  return data.accessToken
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status

    // On an expired/invalid access token, try a single silent refresh and
    // replay the original request. `_retry` guards against infinite loops if
    // the replayed request also returns 401.
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newAccessToken = await refreshAccessToken()
        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          return api(originalRequest)
        }
      } catch {
        // Refresh itself failed — fall through to logout below.
      }

      // No valid session could be recovered: clear auth state (which also wipes
      // the keystore) and send the user back to the entry screen.
      useStore.getState().logout()
      router.replace('/')
    }

    return Promise.reject(handleError(error))
  },
)

export default api
