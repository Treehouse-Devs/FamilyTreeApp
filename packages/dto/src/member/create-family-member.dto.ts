import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator'

export class CreateFamilyMemberDto {
  @IsUUID()
  familyId!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsEnum(['male', 'female'])
  gender!: 'male' | 'female'

  @IsNumber()
  birthDate!: number

  @IsBoolean()
  isBloodRelated!: boolean

  @IsNumber()
  @IsOptional()
  deathDate?: number

  @IsUUID()
  @IsOptional()
  spouseId?: string

  @IsUUID()
  @IsOptional()
  fatherId?: string

  @IsUUID()
  @IsOptional()
  motherId?: string

  @IsString()
  @IsOptional()
  imageThumbnailUrl?: string
}
