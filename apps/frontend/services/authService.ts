import type { LoginResponseDto, RegisterResponseDto, RegisterUserDto } from '@treely/dto'
import { BaseService } from './base'

export class AuthService extends BaseService {
  static async login(email: string, password: string) {
    return this.post<LoginResponseDto>(
      '/auth/login',
      { email, password },
    )
  }

  static async register(data: RegisterUserDto) {
    return this.post<RegisterResponseDto>(
      '/auth/register',
      data,
    )
  }

  static async resetPassword(email: string) {
    return this.post(
      '/auth/reset-password',
      { email },
    )
  }
}
