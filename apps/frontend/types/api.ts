export interface BaseResponseData<T> {
  message?: string
  error?: string
  data?: T // Optional data field for dynamic responses
}
