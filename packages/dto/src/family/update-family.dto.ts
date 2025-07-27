import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateFamilyDto {
  @IsString()
  @IsNotEmpty()
  name!: string
}
