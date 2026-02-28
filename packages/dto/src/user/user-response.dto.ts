export interface UserResponseDto {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  password?: string
  language: 'en' | 'id'
}
