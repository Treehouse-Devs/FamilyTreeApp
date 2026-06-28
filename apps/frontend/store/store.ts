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
import { loadTokens } from '@/lib/tokenStorage'

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
      // Only persist non-sensitive fields here. Tokens are deliberately NOT
      // persisted via AsyncStorage — they live in the OS keystore (see
      // lib/tokenStorage) and are rehydrated separately below.
      partialize: state => ({
        user: state.user,
        hasSeenWelcome: state.hasSeenWelcome,
        colorMode: state.colorMode,
      } as unknown as StoreState),
      // After AsyncStorage rehydration, pull the tokens from secure storage
      // into the in-memory store, then mark hydration complete.
      onRehydrateStorage: () => () => {
        void (async () => {
          try {
            const tokens = await loadTokens()
            if (tokens) {
              useStore.setState({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiredAt: tokens.expiredAt,
              })
            }
          } catch (error) {
            console.error('Failed to load tokens from secure storage:', error)
          } finally {
            useStore.getState().setHydrated(true)
          }
        })()
      },
    },
  ),
)
