import { UserGender } from './user-gender.enum'

export interface ProfileResponseDto {
  id: string
  firebaseUid: string
  name: string
  email: string
  avatarUrl: string | null
  birthDate: number
  gender: UserGender
  language: string
}
