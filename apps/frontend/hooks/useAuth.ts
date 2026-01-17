import { useStore } from '@/store/store'

const MOCK_DATA = process.env.EXPO_PUBLIC_MOCK_DATA === 'true'

const mockUser = {
  id: 'mock-user-1',
  name: 'Mock User',
  email: 'mock@example.com',
}

export function useAuth() {
  const user = useStore(state => state.user)
  const token = useStore(state => state.token)
  const isLoggedIn = useStore(state => !!state.token)
  const login = useStore(state => state.login)
  const logout = useStore(state => state.logout)

  // Bypass login when mock data is enabled
  if (MOCK_DATA) {
    return {
      user: mockUser,
      token: 'mock-token',
      isLoggedIn: true,
      login,
      logout,
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
  }
}
