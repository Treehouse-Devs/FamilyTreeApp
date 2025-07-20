import { StateCreator } from 'zustand'

export interface VerifyEmailData {
  email: string
  token: string
}

interface AuthState {
  user: unknown // Replace 'unknown' with User type
  token: string | null
  verifyEmailData: VerifyEmailData | null
}

interface AuthActions {
  login: (user: unknown, token: string) => void
  logout: () => void
  setVerifyEmailData: (data: VerifyEmailData | null) => void
  clearVerifyEmailData: () => void
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
  verifyEmailData: null,

  login: (user, token) => {
    set({ user, token })
  },

  logout: () => {
    set({ user: null, token: null })
  },

  setVerifyEmailData: (data) => {
    set({ verifyEmailData: data })
  },

  clearVerifyEmailData: () => {
    set({ verifyEmailData: null })
  },
})
