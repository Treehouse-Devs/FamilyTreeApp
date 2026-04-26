import type { StateCreator } from 'zustand'
import type { AppSlice } from './types'

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
