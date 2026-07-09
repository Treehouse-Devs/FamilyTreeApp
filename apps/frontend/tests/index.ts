import { authMocks } from './data/auth'
import { treeMocks, treeMocksWithParams } from './data/trees'
import { userMocks } from './data/user'

export const pseudoUuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)

    return v.toString(16)
  })
}

const DELAY_MS = 500 // Default delay for mock responses
const uuidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/

const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

const mockResponseMap: Record<string, unknown> = {
  ...authMocks,
  ...treeMocks,
  ...userMocks,
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

    // Special handling for create person: POST /trees/:treeId/person
    if (uuidRegex.test(url) && url.includes('/person') && method.toLowerCase() === 'post') {
      const { Gender } = await import('@treely/dto')
      const newPerson = {
        id: pseudoUuidv4(),
        name: 'New Member',
        gender: Gender.MALE,
        birthDate: Date.now(),
        deathDate: undefined,
        imageThumbnailUrl: undefined,
        fullImageUrl: undefined,
        location: { nationality: undefined, hometown: undefined, domicile: undefined },
        contact: { phoneNumber: null, homeNumber: null },
        occupation: { occupation: undefined, officeAddress: undefined },
      }

      return { person: newPerson }
    }

    // Special handling for auth endpoints - return proper mock data
    const authKey = url.replace(/^\//, '')
    if (mockResponseMap[authKey]) {
      return mockResponseMap[authKey]
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
