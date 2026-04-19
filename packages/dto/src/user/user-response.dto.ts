import type { Gender } from '../auth/login-user.dto'

export interface UserResponseDto {
  id: string
  email: string
  name: string
  gender: Gender
  birthDate: number
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  password?: string
  language: 'en' | 'id'
}
