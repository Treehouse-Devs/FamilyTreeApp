import { IsBoolean, IsNumber, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { Gender } from '../profile'

export class CreateFamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsEnum(Gender)
  gender!: Gender

  @IsNumber()
  birthDate!: number

  @IsNumber()
  @IsOptional()
  deathDate?: number

  @IsBoolean()
  isBloodRelated!: boolean

  @IsOptional()
  @IsUUID()
  spouseId?: string

  @IsOptional()
  @IsUUID()
  fatherId?: string

  @IsOptional()
  @IsUUID()
  motherId?: string
}
