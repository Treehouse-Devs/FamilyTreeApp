import axios from 'axios'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
const TIMEOUT = 10000 // 10 seconds

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
})

// Optional: Interceptors (auth, error logging, etc.)
api.interceptors.request.use(
  (config) => {
    // Example: Add token if available
    // const token = AuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config
  },
  error => Promise.reject(
    error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error)),
  ),
)

api.interceptors.response.use(
  response => response,
  (error) => {
    // handle global error messages here
    return Promise.reject(
      error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error)),
    )
  },
)

export default api
