import { authMocks } from './data/auth'
import { treeMocks, treeMocksWithParams } from './data/trees'

const DELAY_MS = 500 // Default delay for mock responses
const uuidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/

const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

const mockResponseMap: Record<string, unknown> = {
  ...authMocks,
  ...treeMocks,
}

export const mockApi = async (url: string, method: string): Promise<unknown> => {
  await delay(DELAY_MS) // Simulate network delay

  // For write operations, return a success response (mock data doesn't persist)
  if (['patch', 'post', 'put', 'delete'].includes(method.toLowerCase())) {
    console.log(`[Mock API] ${method.toUpperCase()} ${url} - returning success (not persisted)`)

    // Special handling for image upload endpoint
    if (url.includes('/image') && method.toLowerCase() === 'post') {
      return {
        fullImageUrl: 'https://picsum.photos/400/400',
        imageThumbnailUrl: 'https://picsum.photos/200/200',
      }
    }

    return { success: true }
  }

  const mockKey = url.replace(/^\//, '') // remove leading slash
  let response
  if (uuidRegex.test(mockKey)) {
    if (mockKey.startsWith('trees/') && mockKey.split('/').length > 3 && mockKey.includes('person')) {
      const personId = mockKey.split('/')[3]

      response = treeMocksWithParams.fetchPersonById(personId)
    } else if (mockKey.startsWith('trees/')) {
      const treeId = mockKey.split('/')[1]

      response = treeMocksWithParams.fetchTreeById(treeId)
    }
  } else {
    response = mockResponseMap[mockKey]
  }

  if (!response) {
    throw new Error(`No mock data found for ${method} ${url}`)
  }

  return response
}
