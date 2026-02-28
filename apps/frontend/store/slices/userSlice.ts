import { StateCreator } from 'zustand'
import { UserResponseDto } from '@treely/dto'

export type User = UserResponseDto

type UserStates = {
  user: User | null
}

type UserActions = {
  setUser: (user: User) => void
  clearUser: () => void
}

export interface UserSlice extends UserStates, UserActions {}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = set => ({
  user: null,

  setUser: (user) => {
    set({ user })
  },

  clearUser: () => {
    set({ user: null })
  },
})
