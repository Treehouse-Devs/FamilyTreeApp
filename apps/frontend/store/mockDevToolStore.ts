import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MockConfig, RequestLog } from '../types/mockDevTool'
import { authMocks } from '@/tests/data/auth'
import { familyCreateMocks, familyDeleteMocks, familyListMocks } from '@/tests/data/family'
import { treeMocks } from '@/tests/data/trees'

// Helper function to get display names for groups
function getGroupDisplayName(groupName: string): string {
  const displayNames: Record<string, string> = {
    auth: 'Authentication',
    families: 'Family Management',
    members: 'Family Members',
    profile: 'User Profile',
    other: 'Other Endpoints',
  }
  return displayNames[groupName] || groupName.charAt(0).toUpperCase() + groupName.slice(1)
}

interface MockDevToolStore {
  // State
  isVisible: boolean
  mockMode: boolean
  selectedEndpoint: string | null
  requestHistory: RequestLog[]
  mockConfigurations: MockConfig[]
  expandedGroups: Set<string>

  // Actions
  toggleVisibility: () => void
  setMockMode: (enabled: boolean) => void
  updateConfiguration: (id: string, updates: Partial<MockConfig>) => void
  updateDynamicCount: (id: string, count: number) => void
  clearHistory: () => void
  clearLocalStorage: () => void
  addRequestLog: (log: RequestLog) => void
  loadDefaultConfigurations: () => void
  saveToStorage: () => void
  loadFromStorage: () => void
  toggleGroupExpansion: (groupName: string) => void
  getEndpointGroups: () => Array<{
    name: string
    displayName: string
    configs: MockConfig[]
    expanded: boolean
  }>
}

const DEFAULT_CONFIGS_BY_GROUP = {
  auth: authMocks,
  families: [...familyCreateMocks, ...familyDeleteMocks, ...familyListMocks],
  trees: treeMocks,
  members: [
    // TODO: Add family members mock configurations
  ],
  profile: [
    // TODO: Add user profile mock configurations
  ],
} as const

// Helper function to flatten grouped configs into a single array with group property
function flattenConfigs(): MockConfig[] {
  const configs: MockConfig[] = []

  Object.entries(DEFAULT_CONFIGS_BY_GROUP).forEach(([groupName, groupConfigs]) => {
    groupConfigs.forEach((config) => {
      configs.push({
        ...config,
        group: groupName,
      } as MockConfig)
    })
  })

  return configs
}

const DEFAULT_MOCK_CONFIGS: MockConfig[] = flattenConfigs()

const ENABLE_DEVTOOLS = process.env.EXPO_PUBLIC_ENABLE_DEVTOOLS === 'true'

export const useMockDevToolStore = create<MockDevToolStore>((set, get) => ({
  // State
  isVisible: false,
  mockMode: process.env.EXPO_PUBLIC_MOCK_DATA === 'true',
  selectedEndpoint: null,
  requestHistory: [],
  mockConfigurations: [],
  expandedGroups: new Set(['auth']), // Default to auth group expanded

  // Actions
  toggleVisibility: () => {
    if (!ENABLE_DEVTOOLS) return
    set(state => ({ ...state, isVisible: !state.isVisible }))
  },

  setMockMode: (enabled: boolean) => {
    set(state => ({ ...state, mockMode: enabled }))
    get().saveToStorage()
  },

  toggleGroupExpansion: (groupName: string) => {
    set((state) => {
      const newExpandedGroups = new Set(state.expandedGroups)
      if (newExpandedGroups.has(groupName)) {
        newExpandedGroups.delete(groupName)
      } else {
        newExpandedGroups.add(groupName)
      }
      return { ...state, expandedGroups: newExpandedGroups }
    })
    get().saveToStorage()
  },

  updateConfiguration: (id: string, updates: Partial<MockConfig>) => {
    set((state) => {
      // If enabling a config, find and disable other configs with the same endpoint
      if (updates.enabled === true) {
        const targetConfig = state.mockConfigurations.find(config => config.id === id)
        if (targetConfig) {
          // Update all configurations
          const updatedConfigs = state.mockConfigurations.map((config) => {
            if (config.id === id) {
              // Enable the target config
              return { ...config, ...updates }
            } else if (config.endpoint === targetConfig.endpoint && config.method === targetConfig.method) {
              // Disable other configs with the same endpoint and method
              return { ...config, enabled: false }
            }
            return config
          })

          return {
            ...state,
            mockConfigurations: updatedConfigs,
          }
        }
      }

      // For other updates (not enabling), just update the specific config
      return {
        ...state,
        mockConfigurations: state.mockConfigurations.map(config =>
          config.id === id ? { ...config, ...updates } : config,
        ),
      }
    })
    get().saveToStorage()
  },

  updateDynamicCount: (id: string, count: number) => {
    set((state) => {
      return {
        ...state,
        mockConfigurations: state.mockConfigurations.map((config) => {
          if (config.id === id && config.isDynamic) {
            // Use the generateData callback if available, otherwise keep original data
            if (config.generateData) {
              config.generateData(count)
            }
            console.log('Generated dynamic data for config:', id, 'Count:', count, config)
            return {
              ...config,
              dynamicCount: count,
            }
          }
          return config
        }),
      }
    })
    get().saveToStorage()
  },

  clearHistory: () => {
    set(state => ({ ...state, requestHistory: [] }))
    get().saveToStorage()
  },

  clearLocalStorage: () => {
    AsyncStorage.clear()
      .then(() => {
        console.log('Local storage cleared successfully')
        // Reset the store to default state
        set(state => ({
          ...state,
          mockMode: process.env.EXPO_PUBLIC_MOCK_DATA === 'true',
          requestHistory: [],
          mockConfigurations: DEFAULT_MOCK_CONFIGS,
          expandedGroups: new Set(['auth']),
        }))
      })
      .catch((error) => {
        console.warn('Failed to clear local storage:', error)
      })
  },

  addRequestLog: (log: RequestLog) => {
    set(state => ({
      ...state,
      requestHistory: [log, ...state.requestHistory.slice(0, 99)], // Keep last 100
    }))
  },

  loadDefaultConfigurations: () => {
    set(state => ({ ...state, mockConfigurations: DEFAULT_MOCK_CONFIGS }))
    get().saveToStorage()
  },

  saveToStorage: () => {
    if (!ENABLE_DEVTOOLS) return
    AsyncStorage.setItem('mock-devtool-config', JSON.stringify({
      mockMode: get().mockMode,
      mockConfigurations: get().mockConfigurations,
      requestHistory: get().requestHistory.slice(0, 20), // Save only last 20
      expandedGroups: Array.from(get().expandedGroups), // Convert Set to Array for storage
    })).catch((error) => {
      console.warn('Failed to save mock devtool config:', error)
    })
  },

  loadFromStorage: () => {
    if (!ENABLE_DEVTOOLS) return
    AsyncStorage.getItem('mock-devtool-config')
      .then((stored) => {
        if (stored) {
          const data = JSON.parse(stored) as MockDevToolStore & { expandedGroups?: string[] }
          set(state => ({
            ...state,
            mockMode: data.mockMode ?? state.mockMode,
            mockConfigurations: data.mockConfigurations?.length > 0
              ? data.mockConfigurations
              : DEFAULT_MOCK_CONFIGS,
            requestHistory: data.requestHistory ?? [],
            expandedGroups: new Set(data.expandedGroups ?? ['auth']), // Convert Array back to Set
          }))
        } else {
          // First time, load defaults
          get().loadDefaultConfigurations()
        }
      })
      .catch((error) => {
        console.warn('Failed to load mock devtool config:', error)
        get().loadDefaultConfigurations()
      })
  },

  // Helper functions
  getEndpointGroups: () => {
    const store = get()
    const groups = new Map<string, MockConfig[]>()

    store.mockConfigurations.forEach((config) => {
      const groupName = config.group || 'other'
      if (!groups.has(groupName)) {
        groups.set(groupName, [])
      }
      groups.get(groupName)!.push(config)
    })

    return Array.from(groups.entries()).map(([name, configs]) => ({
      name,
      displayName: getGroupDisplayName(name),
      configs: configs.sort((a, b) => a.endpoint.localeCompare(b.endpoint)),
      expanded: store.expandedGroups.has(name),
    }))
  },
}))

// Initialize on app start
if (ENABLE_DEVTOOLS) {
  useMockDevToolStore.getState().loadFromStorage()
}
