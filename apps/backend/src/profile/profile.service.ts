import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { UserFromToken } from 'src/auth/auth.types'
import { UpdateProfileDto } from '@treely/dto/profile/update-profile.dto'
import { ProfileResponseDto } from '@treely/dto/profile/profile-response.dto'
import { Gender } from '@treely/dto'
import { StorageService } from 'src/storage/storage.service'

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly storageService: StorageService,
  ) { }

  private toResponseDto(user: User): ProfileResponseDto {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      birthDate: Number(user.birthDate),
      gender: user.gender,
      language: user.language,
    }
  }

  async createProfile(
    uid: string,
    email: string,
    name: string,
    birthDate: number,
    gender: Gender,
  ): Promise<ProfileResponseDto> {
    const user = this.userRepository.create({
      firebaseUid: uid,
      email,
      name,
      birthDate,
      gender,
    })
    await this.userRepository.save(user)

    return this.toResponseDto(user)
  }

  async deleteProfile(uid: string): Promise<void> {
    await this.userRepository.delete({ firebaseUid: uid })
  }

  async getProfile(userFromToken: UserFromToken): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findOneBy({ firebaseUid: userFromToken.uid })

    if (!user) {
      throw new NotFoundException('Profile not found')
    }

    return this.toResponseDto(user)
  }

  async updateProfile(userFromToken: UserFromToken, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    let user = await this.userRepository.findOneBy({ firebaseUid: userFromToken.uid })

    if (!user) {
      throw new NotFoundException('Profile not found')
    }

    if (dto.name !== undefined) user.name = dto.name
    if (dto.gender !== undefined) user.gender = dto.gender
    if (dto.birthDate !== undefined) user.birthDate = dto.birthDate

    user = await this.userRepository.save(user)

    return this.toResponseDto(user)
  }

  async updateProfileImage(userFromToken: UserFromToken, file: Express.Multer.File): Promise<ProfileResponseDto> {
    let user = await this.userRepository.findOneBy({ firebaseUid: userFromToken.uid })

    if (!user) {
      throw new NotFoundException('Profile not found')
    }

    const { avatarUrl } = await this.storageService.uploadUserProfileImage(user.id, file)
    user.avatarUrl = avatarUrl
    user = await this.userRepository.save(user)

    return this.toResponseDto(user)
  }
}
