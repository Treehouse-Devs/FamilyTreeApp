import { useStore } from '@/store/store'

export function useAuth() {
  const user = useStore(state => state.user)
  const token = useStore(state => state.token)
  const isLoggedIn = useStore(state => !!state.token)
  const login = useStore(state => state.login)
  const logout = useStore(state => state.logout)

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
  }
}
