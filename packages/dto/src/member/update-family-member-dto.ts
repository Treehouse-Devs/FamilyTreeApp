import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
export class UpdateFamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName!: string

  @IsEnum(['male', 'female'])
  @IsOptional()
  gender!: 'male' | 'female'

  @IsDateString()
  @IsOptional()
  birthDate!: string

  @IsDateString()
  @IsOptional()
  deathDate?: string
}
