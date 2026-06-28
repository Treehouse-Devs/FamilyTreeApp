import type { StateCreator } from 'zustand'
import type { AuthSlice } from './types'
import { clearTokens, saveTokens } from '@/lib/tokenStorage'

export const createAuthSlice: StateCreator<
  AuthSlice,
  [],
  [],
  AuthSlice
> = set => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  expiredAt: null,

  login: (user, accessToken, refreshToken, expiredAt) => {
    const normalizedRefresh = refreshToken ?? null
    const normalizedExpiry = expiredAt ?? null
    set({ user, accessToken, refreshToken: normalizedRefresh, expiredAt: normalizedExpiry })
    // Persist credentials to the OS keystore (kept out of plaintext AsyncStorage).
    void saveTokens({ accessToken, refreshToken: normalizedRefresh, expiredAt: normalizedExpiry })
  },

  setTokens: ({ accessToken, refreshToken, expiredAt }) => {
    set({ accessToken, refreshToken, expiredAt })
    void saveTokens({ accessToken, refreshToken, expiredAt })
  },

  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null, expiredAt: null })
    void clearTokens()
  },
})
