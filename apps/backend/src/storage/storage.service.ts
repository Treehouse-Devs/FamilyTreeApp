import { Injectable } from '@nestjs/common'

export interface UploadResult {
  fullImageUrl: string
  imageThumbnailUrl: string
}

@Injectable()
export abstract class StorageService {
  abstract uploadMemberImage(memberId: string, file: Express.Multer.File): Promise<UploadResult>
  abstract uploadFamilyImage(familyId: string, file: Express.Multer.File): Promise<{ familyImageUrl: string }>
  abstract uploadUserProfileImage(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }>
}
