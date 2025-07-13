import { FamilyNode } from '@/components/list.type'

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

export const familyMocks = [
  {
    id: 'family-list-success',
    endpoint: 'families/list',
    method: 'get',
    enabled: true,
    responseType: 'success',
    delay: 500,
    statusCode: 200,
    description: 'Successful fetch of family list',
    isDynamic: true,
    dynamicCount: 5,
    generateData: (count: number) => ({
      families: generateFamilyData(count),
    }),
    responseData: {
      families: generateFamilyData(5),
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
      families: [],
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
