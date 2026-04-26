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
