import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { GetUser } from 'src/auth/get-user.decorator'
import { UserFromToken } from 'src/auth/auth.types'
import { ProfileService } from './profile.service'
import { UpdateProfileDto } from '@treely/dto/profile/update-profile.dto'
import { ProfileResponseDto } from '@treely/dto/profile/profile-response.dto'

@Controller('profile')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@GetUser() user: UserFromToken): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user)
  }

  @Patch()
  async updateProfile(
    @GetUser() user: UserFromToken,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(user, dto)
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp']
        if (allowed.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false)
        }
      },
    }),
  )
  async updateProfileImage(
    @GetUser() user: UserFromToken,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    return this.profileService.updateProfileImage(user, file)
  }
}
