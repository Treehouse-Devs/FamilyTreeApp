import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Length(8, 20)
  password!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;
}
