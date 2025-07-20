import { BaseService } from './base'

export class AuthService extends BaseService {
  static async login(email: string, password: string) {
    return this.post<{ token: string, user: unknown }>( // TODO: Define a proper User type
      '/auth/login',
      { email, password },
    )
  }

  static async register(email: string, password: string, name: string) {
    return this.post<{ email: string, token: string }>(
      '/auth/register',
      { email, password, name },
    )
  }

  static async forgetPassword(email: string) {
    return this.post(
      '/auth/forget-password',
      { email },
    )
  }

  static async resetPassword(email: string, password: string, token: string) {
    return this.post(
      '/auth/reset-password',
      { email, password, token },
    )
  }
}
