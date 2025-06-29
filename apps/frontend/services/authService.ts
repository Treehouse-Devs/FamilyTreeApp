import { BaseService } from './base'

export class AuthService extends BaseService {
  static async login(email: string, password: string) {
    return this.post<{ token: string, user: unknown }>( // TODO: Define a proper User type
      '/auth/login',
      { email, password },
    )
  }
}
