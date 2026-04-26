import type { StateCreator } from 'zustand'
import type { AuthSlice } from './types'

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
