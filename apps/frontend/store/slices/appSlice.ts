import { StateCreator } from 'zustand'

interface AppState {
  hasSeenWelcome: boolean
}

interface AppActions {
  setHasSeenWelcome: (seen: boolean) => void
}

export interface AppSlice extends AppState, AppActions { }

export const createAppSlice: StateCreator<
  AppSlice,
  [],
  [],
  AppSlice
> = set => ({
  hasSeenWelcome: false,

  setHasSeenWelcome: (seen) => {
    set({ hasSeenWelcome: seen })
  },
})
