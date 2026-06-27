import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Delete,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { RegisterUserDto } from '@treely/dto/auth/register-user.dto'
import { LoginUserDto } from '@treely/dto/auth/login-user.dto'
import { GoogleAuthDto } from '@treely/dto/auth/google-auth.dto'
import { ResetPasswordDto } from '@treely/dto/auth/reset-password.dto'
import { ForgotPasswordDto } from '@treely/dto/auth/forgot-password.dto'
import { EmailVerificationDto } from '@treely/dto/auth/email-verification.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { GetUser } from './get-user.decorator'
import { UserFromToken } from './auth.types'

// Sensitive auth routes are brute-force / abuse targets, so cap them well below the
// global baseline: at most 5 requests per minute per client.
const SENSITIVE_THROTTLE = { default: { limit: 5, ttl: 60_000 } }

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  @Throttle(SENSITIVE_THROTTLE)
  async signUp(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.signUp(registerUserDto)
  }

  @Post('/login')
  @Throttle(SENSITIVE_THROTTLE)
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto)
  }

  @Post('/forgot-password')
  @Throttle(SENSITIVE_THROTTLE)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto)
  }

  @Post('/verification-email')
  @Throttle(SENSITIVE_THROTTLE)
  async sendVerificationEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    return this.authService.sendVerificationEmail(emailVerificationDto)
  }

  @Post('/google-auth')
  @Throttle(SENSITIVE_THROTTLE)
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto)
  }

  @Post('/reset-password')
  @UseGuards(JwtAuthGuard)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @GetUser() user: UserFromToken) {
    return this.authService.resetPassword({ ...resetPasswordDto, email: user.email })
  }

  @Post('/refresh-token')
  @Throttle(SENSITIVE_THROTTLE)
  async refreshToken(@Body() body: { uid: string, refreshToken: string }) {
    return this.authService.refreshToken(body.uid, body.refreshToken)
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteUser(@GetUser() user: UserFromToken) {
    return this.authService.deleteUser(user.uid)
  }
}
