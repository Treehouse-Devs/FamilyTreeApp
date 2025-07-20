import { useStore } from '@/store/store'

export function useAuth() {
  const user = useStore(state => state.user)
  const token = useStore(state => state.token)
  const isLoggedIn = useStore(state => !!state.token)
  const login = useStore(state => state.login)
  const logout = useStore(state => state.logout)
  const verifyEmailData = useStore(state => state.verifyEmailData)
  const setVerifyEmailData = useStore(state => state.setVerifyEmailData)
  const clearVerifyEmailData = useStore(state => state.clearVerifyEmailData)

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    verifyEmailData,
    setVerifyEmailData,
    clearVerifyEmailData,
  }
}
