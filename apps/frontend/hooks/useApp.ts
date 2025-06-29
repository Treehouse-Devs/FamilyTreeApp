import { useStore } from '@/store/store'

export function useApp() {
  const hasSeenWelcome = useStore(state => state.hasSeenWelcome)
  const setHasSeenWelcome = useStore(state => state.setHasSeenWelcome)
  const hydrated = useStore(state => state.hydrated)

  return {
    hasSeenWelcome,
    setHasSeenWelcome,
    hydrated,
  }
}
