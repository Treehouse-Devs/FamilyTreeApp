import type { User } from '@/store/slices/user/types'
import { BaseService } from './base'

export class UserService extends BaseService {
  static async getProfile() {
    return this.get<User>('/profile')
  }

  static async updateProfile(profile: Partial<User>) {
    return this.patch<User>('/profile', profile)
  }

  static async updateProfileImage(imageUri: string) {
    return this.uploadImage<User>('/profile/image', imageUri)
  }
}
