import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { RegisterUserDto } from '@treely/dto/src/user/register-user.dto'
import { LoginResponseDto, LoginUserDto } from '@treely/dto/src/user/login-user.dto'
import { GoogleAuthDto } from '@treely/dto/src/user/google-auth.dto'
import { FirebaseService } from './firebase.service'
import { TokenService } from './token.service'
import { UserFromToken } from './auth.types'
import { FirebaseError } from 'firebase/app'
import { UserRecord } from 'firebase-admin/lib/auth/user-record'
import { MailerService } from 'src/mailer/mailer.service'
import { ForgotPasswordDto } from '@treely/dto/auth/forgot-password.dto'
import { EmailVerificationDto } from '@treely/dto/auth/email-verification.dto'

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
    private tokenService: TokenService,
    private mailerService: MailerService,
  ) { }

  async signUp(registerUserDto: RegisterUserDto): Promise<UserRecord | undefined> {
    const { name, email, password } = registerUserDto
    let userRecord: UserRecord | null = null
    try {
      userRecord = await this.firebaseService.createUser({ displayName: name, email, password })
      await this.sendVerificationEmail({ email: userRecord.email || '' })
      return userRecord
    }
    catch (error) {
      if (userRecord?.uid) {
        try {
          await this.firebaseService.deleteUser(userRecord.uid)
        }
        catch (deleteError) {
          console.error('Rollback failed:', deleteError)
          throw error
        }
      }
      throw error
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = loginUserDto

    try {
      await this.firebaseService.signInWithEmailAndPassword(email, password)
      const userRecord = await this.firebaseService.getUserByEmail(email)

      if (!userRecord.emailVerified) {
        throw new ForbiddenException('Email not verified')
      }

      const tokenPayload: UserFromToken = {
        email: userRecord.email || '',
        uid: userRecord.uid,
        displayName: userRecord.displayName,
      }

      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = this.tokenService.createJwtTokens(tokenPayload)
      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || '',
          providerData: userRecord.providerData,
        },
        accessToken,
        refreshToken,
        refreshTokenExpiredAt,
        expiredAt,
        message: 'Login successful',
      } as LoginResponseDto
    }
    catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error
      }
      else if (error instanceof Error) {
        throw new InternalServerErrorException(error.message)
      }
      else {
        throw new InternalServerErrorException('Unexpected error occured.')
      }
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto
    const link = await this.firebaseService.generateResetPasswordLink(email)

    await this.mailerService.sendTemplateEmail(email, 'Treely Reset Password', 'forgot-password', {
      diplayName: email,
      link,
    })
  }

  async sendVerificationEmail(emailVerificationDto: EmailVerificationDto): Promise<void> {
    const { email } = emailVerificationDto
    const link = await this.firebaseService.generateEmailVerificationLink(email)

    await this.mailerService.sendTemplateEmail(email, 'Treely Email Verification', 'verify-email', {
      displayName: email,
      link,
    })
  }

  async googleAuth(googleAuthDto: GoogleAuthDto): Promise<LoginResponseDto> {
    const { idToken } = googleAuthDto

    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken)

      let userRecord
      try {
        if (!decodedToken.email) {
          throw new UnauthorizedException('Email not found in Google token')
        }
        userRecord = await this.firebaseService.getUserByEmail(decodedToken.email)
      }
      catch (error: unknown) {
        if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
          if (!decodedToken.email) {
            throw new UnauthorizedException('Email not found in Google token')
          }
          userRecord = await this.firebaseService.createUser({
            email: decodedToken.email,
            displayName: decodedToken.name as string,
          })
        }
        else {
          throw error
        }
      }

      const tokenPayload: UserFromToken = {
        email: userRecord.email || '',
        uid: userRecord.uid,
        displayName: userRecord.displayName,
      }

      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = this.tokenService.createJwtTokens(tokenPayload)
      return {
        user: {
          uid: userRecord.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || '',
          providerData: userRecord.providerData,
        },
        accessToken,
        refreshToken,
        refreshTokenExpiredAt,
        expiredAt,
        message: 'Google authentication successful',
      } as LoginResponseDto
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid Google ID token')
      }
      else {
        throw new InternalServerErrorException('Google authentication failed')
      }
    }
  }

  async resetPassword({ email, newPassword }: { email: string, newPassword: string }) {
    try {
      const userRecord = await this.firebaseService.getUserByEmail(email)
      await this.firebaseService.updateUserPassword(userRecord.uid, newPassword)
      return { message: 'Password reset successful' }
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found')
      }
      else {
        throw new InternalServerErrorException('Failed to reset password')
      }
    }
  }

  async refreshToken(uid: string, refreshToken: string): Promise<LoginResponseDto> {
    const stored = this.tokenService.validateRefreshToken(uid, refreshToken)
    const userRecord = await this.firebaseService.getUser(uid)
    const tokenPayload: UserFromToken = {
      email: userRecord.email || '',
      uid: userRecord.uid,
      displayName: userRecord.displayName,
    }

    const { accessToken, expiredAt } = this.tokenService.createJwtTokens(tokenPayload)
    return {
      accessToken,
      expiredAt,
      refreshTokenExpiredAt: stored.expiredAt,
      user: {
        uid: userRecord.uid,
        email: userRecord.email || '',
        displayName: userRecord.displayName || '',
        providerData: userRecord.providerData,
      },
      message: 'Token refreshed successfully',
    } as LoginResponseDto
  }

  async deleteUser(uid: string) {
    try {
      await this.firebaseService.deleteUser(uid)
      this.tokenService.deleteRefreshToken(uid)
      return { message: 'User deleted successfully' }
    }
    catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found')
      }
      else {
        throw new InternalServerErrorException('Failed to delete user')
      }
    }
  }
}
