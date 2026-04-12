import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator'
import { UserGender } from './user-gender.enum'

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsNumber()
  @IsInt()
  @IsOptional()
  birthDate?: number

  @IsEnum(UserGender)
  @IsOptional()
  gender?: UserGender
}
