import { ref } from 'vue'
import { defineStore } from 'pinia'
import { capacitorStorage } from '@/lib/persistedStorage'

export type ColorMode = 'light' | 'dark' | 'system'

/**
 * Ported from the RN app's `store/slices/app`. `hasSeenWelcome` and `colorMode`
 * are persisted (matching the zustand `partialize`); `zoomLevel` is not, since it
 * is transient tree-viewport state.
 */
export const useAppStore = defineStore('app', () => {
  const hasSeenWelcome = ref(false)
  const colorMode = ref<ColorMode>('light')
  const zoomLevel = ref(1)

  /**
   * True once persisted state and the tokens in secure storage have both been
   * read. Route guards wait on this so they never redirect on a half-loaded
   * session — the same job `hydrated` does in the RN store.
   */
  const hydrated = ref(false)

  function setHasSeenWelcome(seen: boolean) {
    hasSeenWelcome.value = seen
  }

  function setColorMode(mode: ColorMode) {
    colorMode.value = mode
  }

  function setZoomLevel(scale: number) {
    zoomLevel.value = scale
  }

  function setHydrated(state: boolean) {
    hydrated.value = state
  }

  return {
    hasSeenWelcome,
    colorMode,
    zoomLevel,
    hydrated,
    setHasSeenWelcome,
    setColorMode,
    setZoomLevel,
    setHydrated,
  }
}, {
  persist: {
    key: 'app-storage',
    storage: capacitorStorage,
    pick: ['hasSeenWelcome', 'colorMode'],
  },
})
