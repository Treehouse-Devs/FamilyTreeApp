import type { Gender } from '../profile'

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
