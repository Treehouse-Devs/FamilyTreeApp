import type { Gender } from './gender.enum'

export interface ProfileResponseDto {
  id: string
  firebaseUid: string
  name: string
  email: string
  avatarUrl: string | null
  birthDate: number
  gender: Gender
  language: string
}
