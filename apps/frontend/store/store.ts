import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import type { AuthSlice } from './slices/auth/types'
import { createAuthSlice } from './slices/auth/authSlice'
import type { AppSlice } from './slices/app/types'
import { createAppSlice } from './slices/app/slice'
import type { StorageValue } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import type { TreeSlice } from './slices/tree/types'
import { createTreeSlice } from './slices/tree/slice'
import type { UserSlice } from './slices/user/types'
import { createUserSlice } from './slices/user/slice'

// Add hydration state to the store
interface HydrationState {
  hydrated: boolean
  setHydrated: (state: boolean) => void
}

export type StoreState = HydrationState & AppSlice & AuthSlice & TreeSlice & UserSlice

export const useStore = create<StoreState>()(
  persist(
    (set, ...a) => ({
      ...createAuthSlice(set, ...a),
      ...createAppSlice(set, ...a),
      ...createTreeSlice(set, ...a),
      ...createUserSlice(set, ...a),
      // Hydration state
      hydrated: false,
      setHydrated: (state: boolean) => {
        set(prevState => ({ ...prevState, hydrated: state }))
      },
    }),
    {
      name: 'app-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name)

          return value ? (JSON.parse(value) as StorageValue<StoreState>) : null
        },
        setItem: async (name: string, value: StorageValue<StoreState>) => {
          await AsyncStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name)
        },
      },
      // Only persist certain fields
      partialize: state => ({
        user: state.user,
        accessToken: state.accessToken,
        hasSeenWelcome: state.hasSeenWelcome,
        colorMode: state.colorMode,
      } as unknown as StoreState),
      // Set hydration state when rehydration is complete
      onRehydrateStorage: () => (state) => {
        if (state && state.hydrated === false) {
          state.setHydrated(true)
        }
      },
    },
  ),
)
