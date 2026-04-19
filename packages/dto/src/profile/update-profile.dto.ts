import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator'
import { Gender } from './gender.enum'

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsNumber()
  @IsInt()
  @IsOptional()
  birthDate?: number

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender
}
