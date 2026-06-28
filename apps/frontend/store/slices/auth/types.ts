interface AuthState {
  user: unknown // Replace 'unknown' with User type
  accessToken: string | null
  refreshToken: string | null
  // Unix timestamp (seconds) when the access token expires.
  expiredAt: number | null
}

interface AuthActions {
  login: (user: unknown, accessToken: string, refreshToken?: string, expiredAt?: number) => void
  // Updates just the tokens (e.g. after a silent refresh) without touching the user.
  setTokens: (tokens: { accessToken: string, refreshToken: string | null, expiredAt: number | null }) => void
  logout: () => void
}

export interface AuthSlice extends AuthState, AuthActions { }
