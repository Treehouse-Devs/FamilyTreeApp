import type { StateCreator } from 'zustand'
import type { UserResponseDto } from '@treely/dto'

export type User = UserResponseDto

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

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
