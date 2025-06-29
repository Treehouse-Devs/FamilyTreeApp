import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { LoginUserDto } from "./dtos/login-user.dto";

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
}
