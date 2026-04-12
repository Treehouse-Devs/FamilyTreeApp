import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { UserFromToken } from 'src/auth/auth.types'
import { ProfileResponseDto } from '@treely/dto/profile/profile-response.dto'
import { UpdateProfileDto } from '@treely/dto/profile/update-profile.dto'
import { UserGender } from '@treely/dto/index'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUser: UserFromToken = { uid: 'firebase-uid-1', email: 'john@example.com', displayName: 'John Doe' }

function makeProfileResponse(overrides: Partial<ProfileResponseDto> = {}): ProfileResponseDto {
  return {
    id: 'user-1',
    firebaseUid: 'firebase-uid-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: null,
    birthDate: 0,
    gender: UserGender.MALE,
    language: 'en',
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProfileController', () => {
  let controller: ProfileController

  const profileService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateProfileImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [{ provide: ProfileService, useValue: profileService }],
    }).compile()

    controller = module.get<ProfileController>(ProfileController)
    jest.clearAllMocks()
  })

  // ─── getProfile ────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return the profile from the service', async () => {
      const profile = makeProfileResponse()
      profileService.getProfile.mockResolvedValue(profile)

      const result = await controller.getProfile(mockUser)

      expect(profileService.getProfile).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(profile)
    })

    it('should propagate errors thrown by ProfileService', async () => {
      profileService.getProfile.mockRejectedValue(new NotFoundException())

      await expect(controller.getProfile(mockUser)).rejects.toThrow(NotFoundException)
    })
  })

  // ─── updateProfile ─────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    const updateDto: UpdateProfileDto = { name: 'Jane Doe', gender: UserGender.FEMALE }

    it('should return the updated profile from the service', async () => {
      const updatedProfile = makeProfileResponse({ name: 'Jane Doe', gender: UserGender.FEMALE })
      profileService.updateProfile.mockResolvedValue(updatedProfile)

      const result = await controller.updateProfile(mockUser, updateDto)

      expect(profileService.updateProfile).toHaveBeenCalledWith(mockUser, updateDto)
      expect(result).toEqual(updatedProfile)
    })

    it('should propagate NotFoundException from ProfileService', async () => {
      profileService.updateProfile.mockRejectedValue(new NotFoundException('Profile not found'))

      await expect(controller.updateProfile(mockUser, updateDto)).rejects.toThrow(
        new NotFoundException('Profile not found'),
      )
    })

    it('should pass the full DTO to the service unchanged', async () => {
      const fullDto: UpdateProfileDto = {
        name: 'Alice',
        gender: UserGender.FEMALE,
        birthDate: 631152000000,
      }
      profileService.updateProfile.mockResolvedValue(makeProfileResponse())

      await controller.updateProfile(mockUser, fullDto)

      expect(profileService.updateProfile).toHaveBeenCalledWith(mockUser, fullDto)
    })
  })

  // ─── updateProfileImage ────────────────────────────────────────────────────

  describe('updateProfileImage', () => {
    const mockFile = {
      fieldname: 'image',
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from(''),
      size: 2048,
    } as Express.Multer.File

    it('should throw BadRequestException when no file is provided', async () => {
      const noFile = undefined as unknown as Express.Multer.File

      await expect(controller.updateProfileImage(mockUser, noFile)).rejects.toThrow(
        new BadRequestException('No file uploaded'),
      )
      expect(profileService.updateProfileImage).not.toHaveBeenCalled()
    })

    it('should return the updated profile with new avatarUrl', async () => {
      const avatarUrl = 'https://cdn.example.com/avatar.jpg'
      const updatedProfile = makeProfileResponse({ avatarUrl })
      profileService.updateProfileImage.mockResolvedValue(updatedProfile)

      const result = await controller.updateProfileImage(mockUser, mockFile)

      expect(profileService.updateProfileImage).toHaveBeenCalledWith(mockUser, mockFile)
      expect(result).toEqual(updatedProfile)
    })

    it('should propagate errors thrown by ProfileService', async () => {
      profileService.updateProfileImage.mockRejectedValue(new NotFoundException('Profile not found'))

      await expect(controller.updateProfileImage(mockUser, mockFile)).rejects.toThrow(NotFoundException)
    })
  })
})
