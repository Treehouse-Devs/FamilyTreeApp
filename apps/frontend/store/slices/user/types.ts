import { type UserResponseDto } from '@treely/dto'

export type User = UserResponseDto

type UserStates = {
  user: User | null
}

type UserActions = {
  setUser: (user: User) => void
  clearUser: () => void
}

export interface UserSlice extends UserStates, UserActions {}
