import { IsString, IsNotEmpty } from 'class-validator'

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  email!: string
}
