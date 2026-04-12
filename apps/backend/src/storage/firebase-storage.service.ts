import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { admin } from '../config/firebase.config'
import { StorageService, UploadResult } from './storage.service'

@Injectable()
export class FirebaseStorageService extends StorageService {
  constructor(private readonly configService: ConfigService) {
    super()
  }

  private get bucket() {
    const bucketName = this.configService.get<string>('FB_STORAGE_BUCKET')

    return admin.storage().bucket(bucketName)
  }

  private assertSafeId(id: string): void {
    if (!/^[0-9a-f-]{36}$/.test(id)) {
      throw new BadRequestException('Invalid ID format')
    }
  }

  private async uploadFile(remotePath: string, buffer: Buffer, mimeType: string): Promise<string> {
    const file = this.bucket.file(remotePath)
    try {
      await file.save(buffer, {
        metadata: { contentType: mimeType },
        resumable: false,
      })
      await file.makePublic()
    } catch {
      throw new InternalServerErrorException('Failed to upload image to Firebase Storage')
    }

    return file.publicUrl()
  }

  async uploadMemberImage(memberId: string, file: Express.Multer.File): Promise<UploadResult> {
    this.assertSafeId(memberId)
    const mimeType = file.mimetype || 'image/webp'
    const [fullImageUrl, imageThumbnailUrl] = await Promise.all([
      this.uploadFile(`members/${memberId}/profile.webp`, file.buffer, mimeType),
      this.uploadFile(`members/${memberId}/profile-thumb.webp`, file.buffer, mimeType),
    ])

    return { fullImageUrl, imageThumbnailUrl }
  }

  async uploadFamilyImage(familyId: string, file: Express.Multer.File): Promise<{ familyImageUrl: string }> {
    this.assertSafeId(familyId)
    const mimeType = file.mimetype || 'image/webp'
    const familyImageUrl = await this.uploadFile(`families/${familyId}/family.webp`, file.buffer, mimeType)

    return { familyImageUrl }
  }

  async uploadUserProfileImage(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    this.assertSafeId(userId)
    const mimeType = file.mimetype || 'image/webp'
    const avatarUrl = await this.uploadFile(`users/${userId}/avatar.webp`, file.buffer, mimeType)

    return { avatarUrl }
  }
}
