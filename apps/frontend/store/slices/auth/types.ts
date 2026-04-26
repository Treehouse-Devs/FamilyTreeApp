interface AuthState {
  user: unknown // Replace 'unknown' with User type
  accessToken: string | null
  refreshToken: string | null
}

interface AuthActions {
  login: (user: unknown, accessToken: string, refreshToken?: string) => void
  logout: () => void
}

export interface AuthSlice extends AuthState, AuthActions { }
