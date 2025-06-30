import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { LoginUserDto } from "./dtos/login-user.dto";
import { GoogleAuthDto } from "./dtos/google-auth.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { GetUser } from "./get-user.decorator";

@Controller("user")
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/signup")
  async signUp(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.signUp(registerUserDto);
  }

  @Post("/login")
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post("/google-auth")
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    return this.userService.googleAuth(googleAuthDto);
  }

  @Post("/reset-password")
  @UseGuards(JwtAuthGuard)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @GetUser() user: any) {
    return this.userService.resetPassword({ ...resetPasswordDto, email: user.email });
  }

  @Post("/refresh-token")
  async refreshToken(@Body() body: { uid: string; refreshToken: string }) {
    return this.userService.refreshToken(body.uid, body.refreshToken);
  }
}
