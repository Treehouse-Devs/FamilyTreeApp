import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator'
import { Gender } from '../profile/gender.enum'
import type { UserResponse } from './login-user.dto'

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsNotEmpty()
  @Length(8, 20)
  password!: string

  @IsNotEmpty()
  @IsString()
  name!: string

  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  birthDate!: number

  @IsNotEmpty()
  @IsEnum(Gender)
  gender!: Gender
}

export class RegisterResponseDto {
  user!: UserResponse
}
