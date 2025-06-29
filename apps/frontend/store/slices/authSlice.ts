import { StateCreator } from 'zustand'

interface AuthState {
  user: unknown // Replace 'unknown' with User type
  token: string | null
}

interface AuthActions {
  login: (user: unknown, token: string) => void
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
  token: null,

  login: (user, token) => {
    set({ user, token })
  },

  logout: () => {
    set({ user: null, token: null })
  },
})
