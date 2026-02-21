import { IsUUID } from 'class-validator'

export class UploadFamilyMemberProfilePictureDto {
  @IsUUID()
  familyId!: string

  @IsUUID()
  memberId!: string

  // The image file is expected as multipart form data (field name: 'image'),
  // validated at the controller/interceptor level rather than via class-validator.
}
