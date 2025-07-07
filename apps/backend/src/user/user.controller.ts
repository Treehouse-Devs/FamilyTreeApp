import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Delete,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterUserDto } from "@myorg/dto/src/user/register-user.dto";
import { LoginUserDto } from "@myorg/dto/src/user/login-user.dto";
import { GoogleAuthDto } from "@myorg/dto/src/user/google-auth.dto";
import { ResetPasswordDto } from "@myorg/dto/src/user/reset-password.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { GetUser } from "./get-user.decorator";
import { UserFromToken } from "./user.types";

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
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @GetUser() user: UserFromToken) {
    return this.userService.resetPassword({ ...resetPasswordDto, email: user.email });
  }

  @Post("/refresh-token")
  async refreshToken(@Body() body: { uid: string; refreshToken: string }) {
    return this.userService.refreshToken(body.uid, body.refreshToken);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteUser(@GetUser() user: UserFromToken) {
    return this.userService.deleteUser(user.uid);
  }
}
