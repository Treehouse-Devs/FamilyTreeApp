import 'reflect-metadata'

// Family DTOs
export { CreateFamilyDto } from './family/create-family.dto'
export { UpdateFamilyDto } from './family/update-family.dto'
export { DeleteFamilyDto } from './family/delete-family.dto'
export { UploadFamilyProfilePictureDto } from './family/upload-family-profile-picture.dto'
export type {
  FlatPersonDto,
  FlatTreeDto,
  PersonDto,
  TreeDto,
  UploadFamilyImageResponseDto,
} from './family/family-response.dto'

// Member DTOs
export { CreateFamilyMemberDto } from './member/create-family-member.dto'
export { PatchFamilyMemberDto } from './member/patch-family-member-dto'
export type {
  DetailedPersonDto,
  UploadMemberImageResponseDto,
} from './member/member-response.dto'
export { RelationType } from './member/relation-type.enum'

// Auth DTOs
export { RegisterUserDto, RegisterResponseDto } from './auth/register-user.dto'
export { LoginUserDto } from './auth/login-user.dto'
export { ResetPasswordDto } from './auth/reset-password.dto'
export type {
  LoginResponseDto,
  UserInfo,
  UserResponse,
} from './auth/login-user.dto'
export { GoogleAuthDto } from './auth/google-auth.dto'
export { ForgotPasswordDto } from './auth/forgot-password.dto'
export { EmailVerificationDto } from './auth/email-verification.dto'

// User DTOs
export type { UserResponseDto } from './user/user-response.dto'

// Profile DTOs
export { UpdateProfileDto } from './profile/update-profile.dto'
export { Gender } from './profile/gender.enum'
export type { ProfileResponseDto } from './profile/profile-response.dto'
