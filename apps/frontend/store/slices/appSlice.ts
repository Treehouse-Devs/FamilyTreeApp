import { StateCreator } from 'zustand'

export type ColorMode = 'light' | 'dark' | 'system'

interface AppState {
  hasSeenWelcome: boolean
  colorMode: ColorMode
  zoomLevel: number
}

interface AppActions {
  setHasSeenWelcome: (seen: boolean) => void
  setColorMode: (mode: ColorMode) => void
  setZoomLevel: (scale: number) => void
}

export interface AppSlice extends AppState, AppActions { }

export const createAppSlice: StateCreator<
  AppSlice,
  [],
  [],
  AppSlice
> = set => ({
  hasSeenWelcome: false,
  colorMode: 'light',
  zoomLevel: 1,

  setHasSeenWelcome: (seen) => {
    set({ hasSeenWelcome: seen })
  },

  setColorMode: (mode) => {
    set({ colorMode: mode })
  },

  setZoomLevel: (scale) => {
    set({ zoomLevel: scale })
  },
})
