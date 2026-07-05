import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { MemberService } from './member.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { FamilyMember } from './entities/family-member.entity'
import { FamilyService } from 'src/family/family.service'
import { StorageService } from 'src/storage/storage.service'
import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { Gender } from '@treely/dto'
import type { Family } from 'src/family/entities/family.entity'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMember(overrides: Partial<FamilyMember> = {}): FamilyMember {
  return {
    id: 'member-1',
    familyId: 'family-1',
    family: {} as Family,
    fullName: 'John Doe',
    gender: Gender.MALE,
    birthDate: new Date('1990-01-01').getTime(),
    deathDate: null!,
    isBloodRelated: true,
    imageThumbnailUrl: null,
    fullImageUrl: null,
    nationality: null,
    hometown: null,
    domicile: null,
    phoneNumber: null,
    homeNumber: null,
    occupation: null,
    officeAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null!,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MemberService', () => {
  let service: MemberService

  // Mock repositories
  // Mock EntityManager used by repository transactions.
  const mockManager = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  }

  const memberRepository = {
    manager: {
      transaction: jest.fn((fn: (manager: typeof mockManager) => Promise<unknown>) => fn(mockManager)),
    },
    findOneBy: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  }

  const familyService = {
    findOne: jest.fn(),
  }

  const storageService = {
    uploadMemberImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        { provide: getRepositoryToken(FamilyMember), useValue: memberRepository },
        { provide: FamilyService, useValue: familyService },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile()

    service = module.get<MemberService>(MemberService)
    jest.clearAllMocks()
  })

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const baseDto = {
      name: 'Jane Doe',
      gender: Gender.FEMALE,
      birthDate: new Date('1992-05-10').getTime(),
      deathDate: undefined,
      isBloodRelated: true,
      spouseId: undefined,
      fatherId: undefined,
      motherId: undefined,
    }

    it('should throw ForbiddenException when family does not belong to user', async () => {
      familyService.findOne.mockResolvedValue(null)

      await expect(service.create(baseDto, 'family-1', 'user-1')).rejects.toThrow(ForbiddenException)
    })

    it('should create a member when it is the first member in the family (no relationships required)', async () => {
      const family = { id: 'family-1' }
      const createdMember = makeMember({ fullName: 'Jane Doe', gender: Gender.FEMALE })

      familyService.findOne.mockResolvedValue(family)
      mockManager.create.mockReturnValue(createdMember)
      mockManager.save.mockResolvedValue(createdMember)
      const result = await service.create(baseDto, 'family-1', 'user-1')

      expect(mockManager.create).toHaveBeenCalledWith(FamilyMember, expect.objectContaining({ fullName: 'Jane Doe' }))
      expect(result).toMatchObject({ id: createdMember.id, name: createdMember.fullName })
    })

    it('should synchronize a spouse link when spouseId is provided', async () => {
      const newMember = makeMember({ id: 'new-member' })

      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.create.mockReturnValue(newMember)
      mockManager.save.mockResolvedValue(newMember)

      const result = await service.create({ ...baseDto, spouseId: 'spouse-id' }, 'family-1', 'user-1')

      expect(mockManager.update).toHaveBeenCalledWith(
        FamilyMember,
        { id: 'spouse-id' },
        { spouseId: 'new-member' },
      )
      expect(result).toMatchObject({ id: newMember.id })
    })
  })

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should throw NotFoundException when member is not found', async () => {
      memberRepository.findOneBy.mockResolvedValue(null)

      await expect(service.findOne('family-1', 'member-1', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException when family does not belong to user', async () => {
      memberRepository.findOneBy.mockResolvedValue(makeMember())
      familyService.findOne.mockResolvedValue(null)

      await expect(service.findOne('family-1', 'member-1', 'user-1')).rejects.toThrow(ForbiddenException)
    })

    it('should return the member when found and authorized', async () => {
      const member = makeMember()
      memberRepository.findOneBy.mockResolvedValue(member)
      familyService.findOne.mockResolvedValue({ id: 'family-1' })

      const result = await service.findOne('family-1', 'member-1', 'user-1')

      expect(result).toEqual(member)
    })
  })

  // ─── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should soft delete the member', async () => {
      memberRepository.findOneBy.mockResolvedValue(makeMember())
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.update.mockResolvedValue(undefined)
      mockManager.softDelete.mockResolvedValue(undefined)

      await service.delete('family-1', 'member-1', 'user-1')

      expect(mockManager.softDelete).toHaveBeenCalledWith(FamilyMember, 'member-1')
    })

    it('should propagate NotFoundException from findOne when member not found', async () => {
      memberRepository.findOneBy.mockResolvedValue(null)

      await expect(service.delete('family-1', 'member-1', 'user-1')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findOneDetailed ───────────────────────────────────────────────────────

  describe('findOneDetailed', () => {
    it('should throw NotFoundException when member is not found in the tree', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(null)

      await expect(service.findOneDetailed('family-1', 'member-1', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should return a DetailedPersonDto with minimal fields', async () => {
      const member = makeMember({ birthDate: new Date('1990-01-01').getTime() })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(member)
      memberRepository.find.mockResolvedValue([])

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.id).toBe('member-1')
      expect(result.name).toBe('John Doe')
      expect(result.gender).toBe(Gender.MALE)
      expect(result.birthDate).toBe(new Date('1990-01-01').getTime())
      expect(result.location).toBeUndefined()
      expect(result.contact).toBeUndefined()
      expect(result.occupation).toBeUndefined()
    })

    it('should include location when nationality/hometown/domicile are present', async () => {
      const member = makeMember({ nationality: 'ID', hometown: 'Jakarta', domicile: 'Bandung' })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(member)
      memberRepository.find.mockResolvedValue([])

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.location).toEqual({ nationality: 'ID', hometown: 'Jakarta', domicile: 'Bandung' })
    })

    it('should include contact when phoneNumber is present', async () => {
      const member = makeMember({ phoneNumber: '+628123456789', homeNumber: null })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(member)
      memberRepository.find.mockResolvedValue([])

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.contact).toEqual({ phoneNumber: '+628123456789', homeNumber: null })
    })

    it('should include occupation when occupation fields are present', async () => {
      const member = makeMember({ occupation: 'Engineer', officeAddress: 'Jl. Merdeka 1' })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(member)
      memberRepository.find.mockResolvedValue([])

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.occupation).toEqual({ occupation: 'Engineer', officeAddress: 'Jl. Merdeka 1' })
    })

    it('should include deathDate timestamp when deathDate is set', async () => {
      const member = makeMember({ deathDate: new Date('2020-06-15').getTime() })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(member)
      memberRepository.find.mockResolvedValue([])

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.deathDate).toBe(new Date('2020-06-15').getTime())
    })
  })

  // ─── updateDetailed ────────────────────────────────────────────────────────

  describe('updateDetailed', () => {
    const patchDto = {
      name: 'Updated Name',
      gender: 'male' as const,
      location: { nationality: 'US', hometown: 'New York', domicile: 'LA' },
      contact: { phoneNumber: '+1234567890', homeNumber: null },
      occupation: { occupation: 'Developer', officeAddress: '123 Silicon Valley' },
    }

    it('should throw NotFoundException when member is not found in the tree', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(null)

      await expect(service.updateDetailed('family-1', 'member-1', patchDto, 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should update member fields and return detailed dto', async () => {
      const member = makeMember()
      const updatedMember = makeMember({
        fullName: 'Updated Name',
        nationality: 'US',
        hometown: 'New York',
        domicile: 'LA',
        phoneNumber: '+1234567890',
        occupation: 'Developer',
        officeAddress: '123 Silicon Valley',
      })

      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValueOnce(member).mockResolvedValueOnce(updatedMember)
      memberRepository.find.mockResolvedValue([])
      memberRepository.update.mockResolvedValue(undefined)

      const result = await service.updateDetailed('family-1', 'member-1', patchDto, 'user-1')

      expect(memberRepository.update).toHaveBeenCalledWith(
        'member-1',
        expect.objectContaining({
          fullName: 'Updated Name',
          nationality: 'US',
          phoneNumber: '+1234567890',
          occupation: 'Developer',
        }),
      )
      expect(result.name).toBe('Updated Name')
    })
  })

  // ─── updateMemberImage ─────────────────────────────────────────────────────

  describe('updateMemberImage', () => {
    const mockFile = {
      fieldname: 'file',
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from(''),
      size: 1024,
    } as Express.Multer.File

    it('should throw NotFoundException when member is not found in the tree', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(null)

      await expect(service.updateMemberImage('family-1', 'member-1', mockFile, 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should upload image and update member image URLs', async () => {
      const member = makeMember()
      const uploadResult = { fullImageUrl: 'https://cdn.example.com/full.jpg', imageThumbnailUrl: 'https://cdn.example.com/thumb.jpg' }

      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOneBy.mockResolvedValue(member)
      storageService.uploadMemberImage.mockResolvedValue(uploadResult)
      memberRepository.update.mockResolvedValue(undefined)

      const result = await service.updateMemberImage('family-1', 'member-1', mockFile, 'user-1')

      expect(storageService.uploadMemberImage).toHaveBeenCalledWith('member-1', mockFile)
      expect(memberRepository.update).toHaveBeenCalledWith('member-1', {
        fullImageUrl: uploadResult.fullImageUrl,
        imageThumbnailUrl: uploadResult.imageThumbnailUrl,
      })
      expect(result).toEqual(uploadResult)
    })
  })
})
