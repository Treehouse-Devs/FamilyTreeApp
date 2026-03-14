import { StateCreator } from 'zustand'

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

export const createAuthSlice: StateCreator<
  AuthSlice,
  [],
  [],
  AuthSlice
> = set => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  login: (user, accessToken, refreshToken) => {
    set({ user, accessToken, refreshToken: refreshToken ?? null })
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null })
  },
})
