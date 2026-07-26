import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app'
import type { ColorMode } from '@/stores/app'

/**
 * Applies the store's `colorMode` to a `.dark` class on <html>, which is what the
 * Tailwind theme's `@custom-variant dark` keys off.
 *
 * This is the web-native equivalent of the RN app's `GluestackUIProvider`, which
 * swaps its CSS-variable blocks on a wrapper View — and it matches the DOM
 * implementation already sitting in that provider's `script.ts`.
 */
export function useColorMode() {
  const appStore = useAppStore()
  const { colorMode } = storeToRefs(appStore)

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

  function apply(mode: ColorMode) {
    const resolved = mode === 'system' ? (prefersDark.matches ? 'dark' : 'light') : mode
    document.documentElement.classList.toggle('dark', resolved === 'dark')
    document.documentElement.classList.toggle('light', resolved !== 'dark')
  }

  watch(colorMode, apply, { immediate: true })

  // Only relevant while the user has chosen 'system'.
  prefersDark.addEventListener('change', () => {
    if (colorMode.value === 'system') apply('system')
  })

  return {
    colorMode,
    setColorMode: appStore.setColorMode,
  }
}
