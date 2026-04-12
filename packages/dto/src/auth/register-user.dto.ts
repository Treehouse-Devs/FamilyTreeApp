import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator'
import { UserGender } from '../profile/user-gender.enum'

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
  @IsEnum(UserGender)
  gender!: UserGender
}
