import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Length(8, 20)
  password!: string;
}
