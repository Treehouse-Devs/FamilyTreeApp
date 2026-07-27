import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ProfileService } from './profile.service'
import { User } from './entities/user.entity'
import { StorageService } from 'src/storage/storage.service'
import { Gender } from '@treely/dto/index'
import type { TestingModule } from '@nestjs/testing'
import type { UpdateProfileDto } from '@treely/dto/profile/update-profile.dto'
import type { UserFromToken } from 'src/auth/auth.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    firebaseUid: 'firebase-uid-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatarUrl: null,
    birthDate: 0,
    gender: Gender.MALE,
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null!,
    ...overrides,
  } as User
}

function makeUserFromToken(overrides: Partial<UserFromToken> = {}): UserFromToken {
  return {
    uid: 'firebase-uid-1',
    email: 'john@example.com',
    displayName: 'John Doe',
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProfileService', () => {
  let service: ProfileService

  const userRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const storageService = {
    uploadUserProfileImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile()

    service = module.get<ProfileService>(ProfileService)
    jest.clearAllMocks()
  })

  // ─── getProfile ────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return profile DTO when user already exists', async () => {
      const user = makeUser()
      const userFromToken = makeUserFromToken()
      userRepository.findOneBy.mockResolvedValue(user)

      const result = await service.getProfile(userFromToken)

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ firebaseUid: userFromToken.uid })
      expect(userRepository.create).not.toHaveBeenCalled()
      expect(userRepository.save).not.toHaveBeenCalled()
      expect(result).toEqual({
        id: user.id,
        firebaseUid: user.firebaseUid,
        name: user.name,
        email: 'john@example.com',
        avatarUrl: user.avatarUrl,
        birthDate: 0,
        gender: user.gender,
        language: user.language,
      })
    })

    it('should throw NotFoundException when the profile does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null)

      await expect(service.getProfile(makeUserFromToken())).rejects.toThrow(
        new NotFoundException('Profile not found'),
      )
    })

    it('should convert birthDate from bigint string to number', async () => {
      const user = makeUser({ birthDate: 631152000000 })
      userRepository.findOneBy.mockResolvedValue(user)

      const result = await service.getProfile(makeUserFromToken())

      expect(result.birthDate).toBe(631152000000)
    })

    it('should return 0 for birthDate when stored value is 0', async () => {
      const user = makeUser({ birthDate: 0 })
      userRepository.findOneBy.mockResolvedValue(user)

      const result = await service.getProfile(makeUserFromToken())

      expect(result.birthDate).toBe(0)
    })
  })

  describe('createProfile', () => {
    it('persists the Firebase email in the database profile', async () => {
      const user = makeUser()
      userRepository.create.mockReturnValue(user)
      userRepository.save.mockResolvedValue(user)

      await service.createProfile(
        user.firebaseUid,
        user.email,
        user.name,
        user.birthDate,
        user.gender,
      )

      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        firebaseUid: user.firebaseUid,
        email: user.email,
      }))
    })
  })

  // ─── updateProfile ─────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    const updateDto: UpdateProfileDto = { name: 'Jane Doe', gender: Gender.FEMALE }

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null)

      await expect(service.updateProfile(makeUserFromToken(), updateDto)).rejects.toThrow(
        new NotFoundException('Profile not found'),
      )
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('should update user fields and return updated profile DTO', async () => {
      const user = makeUser()
      const savedUser = makeUser({ name: 'Jane Doe', gender: Gender.FEMALE })
      userRepository.findOneBy.mockResolvedValue(user)
      userRepository.save.mockResolvedValue(savedUser)

      const result = await service.updateProfile(makeUserFromToken(), updateDto)

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'user-1', name: 'Jane Doe', gender: Gender.FEMALE }),
      )
      expect(result).toEqual({
        id: savedUser.id,
        firebaseUid: savedUser.firebaseUid,
        name: savedUser.name,
        email: 'john@example.com',
        avatarUrl: savedUser.avatarUrl,
        birthDate: 0,
        gender: savedUser.gender,
        language: savedUser.language,
      })
    })

    it('should look up user by the correct firebaseUid', async () => {
      const userFromToken = makeUserFromToken({ uid: 'specific-uid' })
      userRepository.findOneBy.mockResolvedValue(null)

      await expect(service.updateProfile(userFromToken, updateDto)).rejects.toThrow(NotFoundException)

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ firebaseUid: 'specific-uid' })
    })

    it('should merge only the provided DTO fields onto the existing user', async () => {
      const user = makeUser({ firebaseUid: 'firebase-uid-1' })
      const partialDto: UpdateProfileDto = { name: 'Only Name Updated' }
      userRepository.findOneBy.mockResolvedValue(user)
      userRepository.save.mockImplementation((u: User) => u)

      const result = await service.updateProfile(makeUserFromToken(), partialDto)

      expect(result.firebaseUid).toBe('firebase-uid-1')
      expect(result.name).toBe('Only Name Updated')
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

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null)

      await expect(service.updateProfileImage(makeUserFromToken(), mockFile)).rejects.toThrow(
        new NotFoundException('Profile not found'),
      )
      expect(storageService.uploadUserProfileImage).not.toHaveBeenCalled()
    })

    it('should upload image with the user id and save the new avatarUrl', async () => {
      const user = makeUser()
      const avatarUrl = 'https://cdn.example.com/avatar.jpg'
      const savedUser = makeUser({ avatarUrl })
      userRepository.findOneBy.mockResolvedValue(user)
      storageService.uploadUserProfileImage.mockResolvedValue({ avatarUrl })
      userRepository.save.mockResolvedValue(savedUser)

      const result = await service.updateProfileImage(makeUserFromToken(), mockFile)

      expect(storageService.uploadUserProfileImage).toHaveBeenCalledWith(user.id, mockFile)
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ avatarUrl }),
      )
      expect(result.avatarUrl).toBe(avatarUrl)
    })

    it('should look up user by the correct firebaseUid before uploading', async () => {
      const userFromToken = makeUserFromToken({ uid: 'some-uid' })
      userRepository.findOneBy.mockResolvedValue(null)

      await expect(service.updateProfileImage(userFromToken, mockFile)).rejects.toThrow(NotFoundException)

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ firebaseUid: 'some-uid' })
      expect(storageService.uploadUserProfileImage).not.toHaveBeenCalled()
    })

    it('should return the full profile DTO after image update', async () => {
      const user = makeUser()
      const avatarUrl = 'https://cdn.example.com/new-avatar.png'
      const savedUser = makeUser({ avatarUrl })
      userRepository.findOneBy.mockResolvedValue(user)
      storageService.uploadUserProfileImage.mockResolvedValue({ avatarUrl })
      userRepository.save.mockResolvedValue(savedUser)

      const result = await service.updateProfileImage(makeUserFromToken(), mockFile)

      expect(result).toEqual({
        id: savedUser.id,
        firebaseUid: savedUser.firebaseUid,
        name: savedUser.name,
        email: 'john@example.com',
        avatarUrl,
        birthDate: 0,
        gender: savedUser.gender,
        language: savedUser.language,
      })
    })
  })
})
