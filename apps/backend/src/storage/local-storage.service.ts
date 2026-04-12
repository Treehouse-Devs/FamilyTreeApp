import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { StorageService, UploadResult } from './storage.service'
import * as path from 'path'
import * as fs from 'fs-extra'
import { ConfigService } from '@nestjs/config'
import sharp from 'sharp'

@Injectable()
export class LocalStorageService extends StorageService {
  constructor(private readonly configService: ConfigService) {
    super()
  }

  private get baseUrl(): string {
    return this.configService.get<string>('APP_URL') ?? 'http://localhost:3000'
  }

  private assertSafeId(id: string): void {
    if (!/^[0-9a-f-]{36}$/.test(id)) {
      throw new BadRequestException('Invalid ID format')
    }
  }

  private buildUrl(...segments: string[]): string {
    return [this.baseUrl, 'uploads', ...segments].join('/')
  }

  private async saveFile(relativePath: string[], buffer: Buffer): Promise<void> {
    const filePath = path.join(process.cwd(), 'uploads', ...relativePath)
    await fs.ensureDir(path.dirname(filePath))

    try {
      await fs.writeFile(filePath, buffer)
    } catch {
      throw new InternalServerErrorException('Failed to save image')
    }
  }

  async uploadMemberImage(memberId: string, file: Express.Multer.File): Promise<UploadResult> {
    this.assertSafeId(memberId)

    const [fullBuffer, thumbBuffer] = await Promise.all([
      sharp(file.buffer).webp({ quality: 90 }).toBuffer(),
      sharp(file.buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toBuffer(),
    ])

    await Promise.all([
      this.saveFile(['members', memberId, 'profile.webp'], fullBuffer),
      this.saveFile(['members', memberId, 'profile-thumb.webp'], thumbBuffer),
    ])

    return {
      fullImageUrl: this.buildUrl('members', memberId, 'profile.webp'),
      imageThumbnailUrl: this.buildUrl('members', memberId, 'profile-thumb.webp'),
    }
  }

  async uploadFamilyImage(familyId: string, file: Express.Multer.File): Promise<{ familyImageUrl: string }> {
    this.assertSafeId(familyId)
    const buffer = await sharp(file.buffer).webp({ quality: 90 }).toBuffer()
    await this.saveFile(['families', familyId, 'family.webp'], buffer)

    return {
      familyImageUrl: this.buildUrl('families', familyId, 'family.webp'),
    }
  }

  async uploadUserProfileImage(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    this.assertSafeId(userId)
    const buffer = await sharp(file.buffer).webp({ quality: 90 }).toBuffer()
    await this.saveFile(['users', userId, 'profile.webp'], buffer)

    return {
      avatarUrl: this.buildUrl('users', userId, 'profile.webp'),
    }
  }
}
