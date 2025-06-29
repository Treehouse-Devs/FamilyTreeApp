import { authMocks } from './data/auth'

const DELAY_MS = 500 // Default delay for mock responses

const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

const mockResponseMap: Record<string, unknown> = {
  ...authMocks,
}

export const mockApi = async (url: string, method: string): Promise<unknown> => {
  await delay(DELAY_MS) // Simulate network delay
  const mockKey = url.replace(/^\//, '') // remove leading slash
  const response = mockResponseMap[mockKey]
  if (!response) {
    throw new Error(`No mock data found for ${method} ${url}`)
  }

  return response
}
