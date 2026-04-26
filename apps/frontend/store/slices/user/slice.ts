import type { StateCreator } from 'zustand'
import type { UserSlice } from './types'

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = set => ({
  user: null,

  setUser: (user) => {
    set({ user })
  },

  clearUser: () => {
    set({ user: null })
  },
})
