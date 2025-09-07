import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { AuthSlice, createAuthSlice } from './slices/authSlice'
import { AppSlice, createAppSlice } from './slices/appSlice'
import { persist, StorageValue } from 'zustand/middleware'
import { createTreeSlice, TreeSlice } from './slices/treeSlice'

// Add hydration state to the store
interface HydrationState {
  hydrated: boolean
  setHydrated: (state: boolean) => void
}

export type StoreState = HydrationState & AppSlice & AuthSlice & TreeSlice

export const useStore = create<StoreState>()(
  persist(
    (set, ...a) => ({
      ...createAuthSlice(set, ...a),
      ...createAppSlice(set, ...a),
      ...createTreeSlice(set, ...a),
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
        token: state.token,
        hasSeenWelcome: state.hasSeenWelcome,
        trees: state.trees,
        persons: state.persons,
        selectedTreeId: state.selectedTreeId,
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
