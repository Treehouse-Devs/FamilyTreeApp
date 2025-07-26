import { IsString, IsNotEmpty } from 'class-validator'

export class EmailVerificationDto {
  @IsNotEmpty()
  @IsString()
  email!: string
}
