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
