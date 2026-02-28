import { IsEmail, IsNotEmpty, Length } from 'class-validator'

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string

  @IsNotEmpty()
  @Length(8, 20)
  password!: string
}

export class LoginResponseDto {
  user!: UserResponse
  accessToken!: string
  refreshToken?: string
  refreshTokenExpiredAt!: number
  expiredAt!: number
  message!: string
}

export class UserInfo {
  uid!: string
  displayName!: string
  email!: string
  providerId!: string
}

export class UserResponse {
  uid!: string
  email!: string
  displayName!: string
  providerData!: UserInfo[]
}
