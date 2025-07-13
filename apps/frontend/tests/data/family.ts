import { FamilyNode } from 'apps/frontend/components/family/list.type'
import { BaseResponseData, MockConfig } from 'types/mockDevTool'

// Generate dynamic family data based on count
export function generateFamilyData(count: number): FamilyNode[] {
  const familyNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
    'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  ]

  return Array.from({ length: count }, (_, index) => ({
    id: `family-${index + 1}`,
    name: `${familyNames[index % familyNames.length]} Family`,
    childrenCount: Math.floor(Math.random() * 8) + 2, // Random 2-9 members
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  }))
}

let familyData: FamilyNode[] = [
  {
    id: 'family-1',
    name: 'Brown Family',
    childrenCount: 3,
    createdAt: new Date('2024-04-05').toISOString(),
  },
  {
    id: 'family-2',
    name: 'Garcia Family',
    childrenCount: 5,
    createdAt: new Date('2024-05-12').toISOString(),
  },
]

const familyHandlers = {
  create: (payload?: object): BaseResponseData<FamilyNode> => {
    if (!payload || typeof payload !== 'object' || !('name' in payload)) {
      throw new Error('Family name is required')
    }

    const familyName = payload.name as string
    if (!familyName || typeof familyName !== 'string') {
      throw new Error('Family name is required')
    }

    const newFamily = {
      id: `family-${Date.now()}`,
      name: familyName,
      childrenCount: 0,
      createdAt: new Date().toISOString(),
    }

    familyData.push(newFamily)

    return {
      message: 'Family created successfully',
      data: newFamily,
    }
  },

  delete: (payload?: object) => {
    if (!payload || typeof payload !== 'object' || !('id' in payload)) {
      throw new Error('Family ID is required')
    }

    const { id } = payload as { id: string }
    const index = familyData.findIndex(family => family.id === id)
    if (index === -1) {
      const error = new Error('Family not found')
      Object.assign(error, { status: 404, data: { message: 'Family not found', error: 'NOT_FOUND' } })
      throw error
    }
    familyData.splice(index, 1)

    return {
      message: 'Family deleted successfully',
      data: { deleted: true },
    }
  },
}

export const familyListMocks: MockConfig[] = [
  {
    id: 'family-list-success',
    endpoint: 'families/list',
    method: 'get',
    enabled: true,
    responseType: 'success',
    delay: 500,
    statusCode: 200,
    description: 'Successful fetch of family list with CRUD simulation',
    allowSearch: ['name'],
    dynamicCount: 2,
    isDynamic: true,
    generateData: (count: number) => {
      familyData = generateFamilyData(count)
    },
    responseData: {
      data: familyData,
    },
  },
  {
    id: 'family-list-empty',
    endpoint: 'families/list',
    method: 'get',
    enabled: false,
    responseType: 'success',
    delay: 300,
    statusCode: 200,
    description: 'Empty family list',
    responseData: {
      data: [],
    },
  },
  {
    id: 'family-list-error',
    endpoint: 'families/list',
    method: 'get',
    enabled: false,
    responseType: 'error',
    delay: 1000,
    statusCode: 500,
    description: 'Server error when fetching family list',
    responseData: {
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    },
  },
]

export const familyCreateMocks: MockConfig[] = [
  {
    id: 'family-create-success',
    endpoint: 'families/create',
    method: 'post',
    enabled: true,
    responseType: 'success',
    delay: 500,
    statusCode: 201,
    description: 'Successful family creation with CRUD simulation',
    handler: familyHandlers.create,
    responseData: {},
  },
  {
    id: 'family-create-error',
    endpoint: 'families/create',
    method: 'post',
    enabled: false,
    responseType: 'error',
    delay: 1000,
    statusCode: 400,
    description: 'Error during family creation',
    responseData: {
      message: 'Family name is required',
      error: 'VALIDATION_ERROR',
    },
  },
]

export const familyDeleteMocks: MockConfig[] = [
  {
    id: 'family-delete-success',
    endpoint: 'families/delete',
    method: 'delete',
    enabled: true,
    responseType: 'success',
    delay: 300,
    statusCode: 200,
    description: 'Successful family deletion with CRUD simulation',
    handler: familyHandlers.delete,
    responseData: {
      message: 'Family deleted successfully',
      data: { deleted: true },
    },
  },
  {
    id: 'family-delete-not-found',
    endpoint: 'families/delete',
    method: 'delete',
    enabled: false,
    responseType: 'error',
    delay: 300,
    statusCode: 404,
    description: 'Family not found during deletion',
    responseData: {
      message: 'Family not found',
      error: 'NOT_FOUND',
    },
  },
]
