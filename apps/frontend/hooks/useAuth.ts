import { useStore } from '@/store/store'

export function useAuth() {
  const user = useStore(state => state.user)
  const accessToken = useStore(state => state.accessToken)
  const isLoggedIn = useStore(state => !!state.accessToken)
  const login = useStore(state => state.login)
  const logout = useStore(state => state.logout)

  return {
    user,
    accessToken,
    isLoggedIn,
    login,
    logout,
  }
}
