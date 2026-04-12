import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Delete,
} from '@nestjs/common'
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

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  async signUp(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.signUp(registerUserDto)
  }

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto)
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto)
  }

  @Post('/verification-email')
  async sendVerificationEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    return this.authService.sendVerificationEmail(emailVerificationDto)
  }

  @Post('/google-auth')
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.googleAuth(googleAuthDto)
  }

  @Post('/reset-password')
  @UseGuards(JwtAuthGuard)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @GetUser() user: UserFromToken) {
    return this.authService.resetPassword({ ...resetPasswordDto, email: user.email })
  }

  @Post('/refresh-token')
  async refreshToken(@Body() body: { uid: string, refreshToken: string }) {
    return this.authService.refreshToken(body.uid, body.refreshToken)
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteUser(@GetUser() user: UserFromToken) {
    return this.authService.deleteUser(user.uid)
  }
}
