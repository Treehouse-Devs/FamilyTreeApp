import { useStore } from '@/store/store'

export const useUser = () => {
  const user = useStore(state => state.user)
  const setUser = useStore(state => state.setUser)
  const clearUser = useStore(state => state.clearUser)

  return {
    user,
    setUser,
    clearUser,
  }
}
