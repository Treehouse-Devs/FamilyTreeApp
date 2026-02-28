import { useStore } from '@/store/store'

export function useColorMode() {
  const colorMode = useStore(state => state.colorMode)
  const setColorMode = useStore(state => state.setColorMode)

  return {
    colorMode,
    setColorMode,
  }
}
