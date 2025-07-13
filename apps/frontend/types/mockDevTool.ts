export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

export interface RequestLog {
  id: string
  timestamp: Date
  method: HttpMethod
  url: string
  requestData: unknown
  responseData: unknown
  responseTime: number
  statusCode: number
  isMocked: boolean
  error?: Error
}

export interface RequestCondition {
  field: string // 'body.email', 'params.id', 'headers.authorization'
  operator: 'equals' | 'contains' | 'startsWith' | 'regex'
  value: string
  response: unknown
}

export interface BaseResponseData<T> {
  message?: string
  error?: string
  data?: T // Optional data field for dynamic responses
}

export interface MockConfig {
  id: string
  endpoint: string
  method: HttpMethod
  enabled: boolean
  responseType: 'success' | 'error' | 'custom'
  delay: number // 0-5000ms
  statusCode: number
  allowSearch?: string[] // Fields that can be searched in the response
  conditions?: RequestCondition[]
  group?: string // Group name for organizing configs
  description?: string // Human-readable description
  dynamicCount?: number // Number of items to generate for dynamic responses
  isDynamic?: boolean // Whether this config uses dynamic data generation
  responseData: BaseResponseData<unknown>
  generateData?: (count: number) => void // Callback function to generate dynamic data
  handler?: (payload?: object) => BaseResponseData<unknown> | null // Custom CRUD handler
}

export interface EndpointGroup {
  name: string
  displayName: string
  configs: MockConfig[]
  expanded?: boolean
}

export interface MockDevTool {
  isVisible: boolean
  mockMode: boolean
  selectedEndpoint: string | null
  requestHistory: RequestLog[]
  mockConfigurations: MockConfig[]
  expandedGroups?: string[] // List of expanded group names
}

export interface MockDevToolContextType {
  isDevMode: boolean
  devTool: MockDevTool
  updateMockConfig: (config: MockConfig) => void
  toggleMockMode: () => void
  clearRequestHistory: () => void
  toggleVisibility: () => void
  addRequestLog: (log: RequestLog) => void
}

export interface AuthScenario {
  name: string
  condition?: RequestCondition
  responseType?: 'success' | 'error'
  statusCode?: number
  response: unknown
  delay?: number
}

export interface AuthMockScenarios {
  'auth/login': AuthScenario[]
}
