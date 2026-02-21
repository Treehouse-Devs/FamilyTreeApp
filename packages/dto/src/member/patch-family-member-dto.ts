import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class LocationDto {
  @IsString()
  @IsOptional()
  nationality?: string

  @IsString()
  @IsOptional()
  hometown?: string

  @IsString()
  @IsOptional()
  domicile?: string
}

class ContactDto {
  @IsNumber()
  @IsOptional()
  phoneNumber?: number | null

  @IsNumber()
  @IsOptional()
  homeNumber?: number | null
}

class OccupationDto {
  @IsString()
  @IsOptional()
  occupation?: string

  @IsString()
  @IsOptional()
  officeAddress?: string
}

export class PatchFamilyMemberDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsEnum(['male', 'female'])
  @IsOptional()
  gender?: 'male' | 'female'

  @IsNumber()
  @IsOptional()
  birthDate?: number

  @IsNumber()
  @IsOptional()
  deathDate?: number

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  location?: LocationDto

  @ValidateNested()
  @Type(() => ContactDto)
  @IsOptional()
  contact?: ContactDto

  @ValidateNested()
  @Type(() => OccupationDto)
  @IsOptional()
  occupation?: OccupationDto
}
