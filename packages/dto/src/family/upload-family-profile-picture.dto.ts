import { IsUUID } from 'class-validator'

export class UploadFamilyProfilePictureDto {
  @IsUUID()
  familyId!: string

  // The image file is expected as multipart form data (field name: 'image'),
  // validated at the controller/interceptor level rather than via class-validator.
}
