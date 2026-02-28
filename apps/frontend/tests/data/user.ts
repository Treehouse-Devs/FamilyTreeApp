import type { User } from '@/store/slices/userSlice'

export const mockUser: User = {
  id: 'u-001',
  name: 'Ahmad Naufal',
  email: 'ahmad@example.com',
  avatarUrl: 'https://picsum.photos/200',
  createdAt: '2022-01-01',
  updatedAt: '2022-01-01',
  language: 'en',
}

export const userMocks: Record<string, unknown> = {
  profile: mockUser,
}
