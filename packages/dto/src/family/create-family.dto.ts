import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  createdByUid!: string

  @IsString()
  @IsOptional()
  image?: string
}
