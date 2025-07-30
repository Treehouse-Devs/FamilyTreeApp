import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
export class CreateFamilyMemberDto {
  @IsUUID()
  familyId!: string

  @IsString()
  @IsNotEmpty()
  fullName!: string

  @IsEnum(['male', 'female'])
  gender!: 'male' | 'female'

  @IsDateString()
  birthDate!: string

  @IsDateString()
  @IsOptional()
  deathDate?: string

  @IsOptional()
  @IsUUID()
  relatedMemberId?: string

  @IsOptional()
  @IsEnum(['PARENT', 'SPOUSE'])
  relationType?: 'PARENT' | 'SPOUSE'
}
