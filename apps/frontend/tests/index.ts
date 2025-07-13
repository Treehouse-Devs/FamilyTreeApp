import { HttpMethod, MockConfig, RequestCondition } from '../types/mockDevTool'
import { useMockDevToolStore } from '../store/mockDevToolStore'

export class MockApi {
  private static evaluateCondition(condition: RequestCondition, payload: object): boolean {
    const value = this.getValueFromPath(payload, condition.field)

    switch (condition.operator) {
      case 'equals':
        return String(value) === condition.value
      case 'contains':
        return String(value).includes(condition.value)
      case 'startsWith':
        return String(value).startsWith(condition.value)
      case 'regex':
        return new RegExp(condition.value).test(String(value))
      default:
        return false
    }
  }

  private static getValueFromPath(obj: object, path: string): unknown {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (current === null) return undefined
      current = (current as Record<string, unknown>)[key]
    }

    return current
  }

  private static findMatchingConfig(
    url: string,
    method: HttpMethod,
    payload?: object,
  ): MockConfig | null {
    const store = useMockDevToolStore.getState()
    const endpoint = url.replace(/^\//, '') // remove leading slash
    const candidates = store.mockConfigurations.filter(config =>
      config.enabled
      && config.endpoint === endpoint
      && config.method === method,
    )

    if (candidates.length === 0) {
      return null
    }

    // Find the first config with matching conditions, or the first without conditions
    const configWithConditions = candidates.find((config) => {
      if (!config.conditions || config.conditions.length === 0) {
        return false
      }

      return config.conditions.some(condition => payload
        && this.evaluateCondition(condition, payload),
      )
    })

    if (configWithConditions) {
      return configWithConditions
    }

    // Return the first config without conditions
    return candidates.find(config => !config.conditions || config.conditions.length === 0) || candidates[0]
  }

  private static async simulateDelay(ms: number): Promise<void> {
    if (ms > 0) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }

  static async handleRequest<T>(
    url: string,
    method: HttpMethod,
    payload?: object,
  ): Promise<T> {
    const config = this.findMatchingConfig(url, method, payload)

    if (!config) {
      throw new Error(`No mock configuration found for ${method.toUpperCase()} ${url}`)
    }

    // Simulate network delay
    await this.simulateDelay(config.delay)

    // Handle error responses
    if (config.responseType === 'error') {
      const errorMessage = (config.responseData as Error).message || 'Mock error'
      const error = new Error(String(errorMessage))
      // Simulate HTTP status codes by adding status to error

      Object.assign(error, { status: config.statusCode, data: config.responseData })
      throw error
    }

    // Check if the config has a custom handler
    console.log(`[MockApi] Handling request for ${method.toUpperCase()} ${url} with config:`, config)
    if (config.handler) {
      return config.handler(payload) as T
    }

    // For conditional responses, check if we should use a specific condition's response
    if (config.conditions && config.conditions.length > 0) {
      const matchingCondition = config.conditions.find(condition => payload
        && this.evaluateCondition(condition, payload),
      )

      if (matchingCondition) {
        return matchingCondition.response as T
      }
    }

    // If search allowed, filter the response data
    if (Array.isArray(config.allowSearch) && payload && typeof payload === 'object' && 'params' in payload && config.responseData.data && Array.isArray(config.responseData.data)) {
      const params: { search?: string } = payload.params || {}
      console.log(`[MockApi] Search params: ${params.search}`, config.allowSearch)
      const value = params.search || ''

      if (value) {
        // Filter the response data based on search parameters
        const filteredResponse = config.responseData.data.filter((item: object) => {
          return config.allowSearch!.some((key) => {
            const itemValue = this.getValueFromPath(item, key)
            if (typeof itemValue === 'string') {
              return itemValue.toLowerCase().includes(value.toLowerCase())
            }
            return false
          })
        })

        return {
          ...config.responseData,
          data: filteredResponse,
        } as T
      }
    }

    // Return the default response
    return config.responseData as T
  }
}
