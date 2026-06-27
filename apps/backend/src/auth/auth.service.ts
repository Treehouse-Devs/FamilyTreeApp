import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { RegisterResponseDto, RegisterUserDto } from '@treely/dto/auth/register-user.dto'
import { LoginResponseDto, LoginUserDto } from '@treely/dto/auth/login-user.dto'
import { GoogleAuthDto } from '@treely/dto/auth/google-auth.dto'
import { FirebaseService } from './firebase.service'
import { TokenService } from './token.service'
import { UserFromToken } from './auth.types'
import { FirebaseError } from 'firebase/app'
import { UserRecord } from 'firebase-admin/lib/auth/user-record'
import { MailerService } from 'src/mailer/mailer.service'
import { ForgotPasswordDto } from '@treely/dto/auth/forgot-password.dto'
import { EmailVerificationDto } from '@treely/dto/auth/email-verification.dto'
import { ProfileService } from 'src/profile/profile.service'
import { ProfileResponseDto } from '@treely/dto/index'

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
    private tokenService: TokenService,
    private mailerService: MailerService,
    private profileService: ProfileService,
  ) { }

  private buildUserResponse(userRecord: UserRecord, profile: ProfileResponseDto) {
    return {
      uid: userRecord.uid,
      email: userRecord.email || '',
      displayName: userRecord.displayName || '',
      providerData: userRecord.providerData.map(p => ({
        uid: p.uid,
        displayName: p.displayName || '',
        email: p.email || '',
        providerId: p.providerId,
        birthDate: profile.birthDate,
        gender: profile.gender,
        language: profile.language,
      })),
    }
  }

  async signUp(registerUserDto: RegisterUserDto): Promise<RegisterResponseDto> {
    const { name, email, password, birthDate, gender } = registerUserDto
    let userRecord: UserRecord | null = null
    try {
      userRecord = await this.firebaseService.createUser({ displayName: name, email, password })
      const profile = await this.profileService.createProfile(userRecord.uid, name, birthDate, gender)
      await this.sendVerificationEmail({ email: userRecord.email || '' })
      profile.email = userRecord.email || ''
      profile.firebaseUid = userRecord.uid

      return {
        user: this.buildUserResponse(userRecord, profile),
      }
    } catch (error) {
      if (userRecord?.uid) {
        try {
          await this.firebaseService.deleteUser(userRecord.uid)
        } catch (error: unknown) {
          if (userRecord?.uid) {
            try {
              await this.firebaseService.deleteUser(userRecord.uid)
            } catch (deleteError) {
              console.error('Rollback failed:', deleteError)
            }
          }
          if (error instanceof HttpException) {
            throw error
          }
          const err = error as Error & { code?: string }
          if (err.code === 'auth/email-already-exists') {
            throw new ConflictException('An account with this email already exists')
          }
          if (err.code?.startsWith('auth/')) {
            throw new HttpException(err.message, 400)
          }
          throw new InternalServerErrorException(err.message || 'Unexpected error occurred during signup')
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

      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = await this.tokenService.createJwtTokens(tokenPayload)
      const profile = await this.profileService.getProfile(tokenPayload)

      return {
        user: this.buildUserResponse(userRecord, profile),
        accessToken,
        refreshToken,
        refreshTokenExpiredAt,
        expiredAt,
        message: 'Login successful',
      } as LoginResponseDto
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error
      } else if (error instanceof Error) {
        throw new InternalServerErrorException(error.message)
      } else {
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
      } catch (error: unknown) {
        if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
          if (!decodedToken.email) {
            throw new UnauthorizedException('Email not found in Google token')
          }
          userRecord = await this.firebaseService.createUser({
            email: decodedToken.email,
            displayName: decodedToken.name as string,
          })
        } else {
          throw error
        }
      }

      const tokenPayload: UserFromToken = {
        email: userRecord.email || '',
        uid: userRecord.uid,
        displayName: userRecord.displayName,
      }

      const { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt } = await this.tokenService.createJwtTokens(tokenPayload)
      const profile = await this.profileService.getProfile(tokenPayload)

      return {
        user: this.buildUserResponse(userRecord, profile),
        accessToken,
        refreshToken,
        refreshTokenExpiredAt,
        expiredAt,
        message: 'Google authentication successful',
      } as LoginResponseDto
    } catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid Google ID token')
      } else {
        throw new InternalServerErrorException('Google authentication failed')
      }
    }
  }

  async resetPassword({ email, newPassword }: { email: string, newPassword: string }) {
    try {
      const userRecord = await this.firebaseService.getUserByEmail(email)
      await this.firebaseService.updateUserPassword(userRecord.uid, newPassword)

      return { message: 'Password reset successful' }
    } catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found')
      } else {
        throw new InternalServerErrorException('Failed to reset password')
      }
    }
  }

  async refreshToken(uid: string, refreshToken: string): Promise<LoginResponseDto> {
    const { refreshToken: newRefreshToken, refreshTokenExpiredAt } = await this.tokenService.rotateRefreshToken(uid, refreshToken)
    const userRecord = await this.firebaseService.getUser(uid)
    const tokenPayload: UserFromToken = {
      email: userRecord.email || '',
      uid: userRecord.uid,
      displayName: userRecord.displayName,
    }

    const { accessToken, expiredAt } = this.tokenService.signAccessToken(tokenPayload)
    const profile = await this.profileService.getProfile(tokenPayload)

    return {
      accessToken,
      expiredAt,
      refreshToken: newRefreshToken,
      refreshTokenExpiredAt,
      user: this.buildUserResponse(userRecord, profile),
      message: 'Token refreshed successfully',
    } as LoginResponseDto
  }

  async deleteUser(uid: string) {
    try {
      await this.firebaseService.deleteUser(uid)
      await this.tokenService.revokeAllForUser(uid)

      return { message: 'User deleted successfully' }
    } catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        throw new NotFoundException('User not found')
      } else {
        throw new InternalServerErrorException('Failed to delete user')
      }
    }
  }
}
