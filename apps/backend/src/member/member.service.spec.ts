import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { MemberService } from './member.service'
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm'
import { FamilyMember } from './entities/family-member.entity'
import { FamilyRelationship } from './entities/family-relationship.entity'
import { FamilyService } from 'src/family/family.service'
import { StorageService } from 'src/storage/storage.service'
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { Gender, RelationType } from '@treely/dto'
import type { Family } from 'src/family/entities/family.entity'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeMember(overrides: Partial<FamilyMember> = {}): FamilyMember {
  return {
    id: 'member-1',
    familyId: 'family-1',
    family: {} as Family,
    fullName: 'John Doe',
    gender: Gender.MALE,
    birthDate: new Date('1990-01-01'),
    deathDate: null!,
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
  const memberRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  }

  const relationshipRepository = {
    create: jest.fn(),
    save: jest.fn(),
  }

  // Mock EntityManager used inside dataSource.transaction
  const mockManager = {
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
  }

  type MockManager = typeof mockManager

  const dataSource = {
    transaction: jest.fn((fn: (manager: MockManager) => Promise<unknown>) => fn(mockManager)),
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
        { provide: getRepositoryToken(FamilyRelationship), useValue: relationshipRepository },
        { provide: getDataSourceToken(), useValue: dataSource },
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
      mockManager.count.mockResolvedValue(1) // only 1 member, so no relationship needed

      const result = await service.create(baseDto, 'family-1', 'user-1')

      expect(mockManager.create).toHaveBeenCalledWith(FamilyMember, expect.objectContaining({ fullName: 'Jane Doe' }))
      expect(result).toMatchObject({ id: createdMember.id, name: createdMember.fullName })
    })

    it('should throw BadRequestException when member count > 1 and no relationship provided', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.create.mockReturnValue(makeMember())
      mockManager.save.mockResolvedValue(makeMember())
      mockManager.count.mockResolvedValue(2) // already has members

      await expect(service.create(baseDto, 'family-1', 'user-1')).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException when spouseId provided but spouse not found', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.create.mockReturnValue(makeMember())
      mockManager.save.mockResolvedValue(makeMember())
      mockManager.count.mockResolvedValue(2)
      mockManager.findOne.mockResolvedValue(null) // spouse not found

      await expect(service.create({ ...baseDto, spouseId: 'spouse-id' }, 'family-1', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should create spouse relationship when spouseId is valid', async () => {
      const spouse = makeMember({ id: 'spouse-id' })
      const newMember = makeMember({ id: 'new-member' })
      const rel = { id: 'rel-1', relationType: RelationType.SPOUSE }

      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.create.mockReturnValueOnce(newMember).mockReturnValueOnce(rel)
      mockManager.save.mockResolvedValue(newMember)
      mockManager.count.mockResolvedValue(2)
      mockManager.findOne.mockResolvedValue(spouse)

      const result = await service.create({ ...baseDto, spouseId: 'spouse-id' }, 'family-1', 'user-1')

      expect(mockManager.create).toHaveBeenCalledWith(
        FamilyRelationship,
        expect.objectContaining({ relationType: RelationType.SPOUSE }),
      )
      expect(result).toMatchObject({ id: newMember.id })
    })

    it('should throw NotFoundException when fatherId provided but father not found', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.create.mockReturnValue(makeMember())
      mockManager.save.mockResolvedValue(makeMember())
      mockManager.count.mockResolvedValue(2)
      mockManager.findOne.mockResolvedValue(null)

      await expect(service.create({ ...baseDto, fatherId: 'missing-father' }, 'family-1', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should throw NotFoundException when motherId provided but mother not found', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.create.mockReturnValue(makeMember())
      mockManager.save.mockResolvedValue(makeMember())
      mockManager.count.mockResolvedValue(2)
      mockManager.findOne.mockResolvedValue(null)

      await expect(service.create({ ...baseDto, motherId: 'missing-mother' }, 'family-1', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should create parent relationships for both father and mother', async () => {
      const father = makeMember({ id: 'father-id', gender: Gender.MALE })
      const mother = makeMember({ id: 'mother-id', gender: Gender.FEMALE })
      const newMember = makeMember({ id: 'new-member' })
      const parentRel = { relationType: RelationType.CHILD }

      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      mockManager.create
        .mockReturnValueOnce(newMember) // member create
        .mockReturnValueOnce(parentRel) // father rel
        .mockReturnValueOnce(parentRel) // mother rel
      mockManager.save.mockResolvedValue(newMember)
      mockManager.count.mockResolvedValue(2)
      // father lookup → father, mother lookup → mother
      mockManager.findOne.mockResolvedValueOnce(father).mockResolvedValueOnce(mother)

      const result = await service.create({ ...baseDto, fatherId: 'father-id', motherId: 'mother-id' }, 'family-1', 'user-1')

      const parentRelCalls = mockManager.create.mock.calls.filter(
        ([entity, data]: [unknown, { relationType?: RelationType }]) =>
          entity === FamilyRelationship && data?.relationType === RelationType.CHILD,
      )
      expect(parentRelCalls).toHaveLength(2)
      expect(result).toMatchObject({ id: newMember.id })
    })
  })

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should throw NotFoundException when member is not found', async () => {
      memberRepository.findOneBy.mockResolvedValue(null)

      await expect(service.findOne('member-1', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException when family does not belong to user', async () => {
      memberRepository.findOneBy.mockResolvedValue(makeMember())
      familyService.findOne.mockResolvedValue(null)

      await expect(service.findOne('member-1', 'user-1')).rejects.toThrow(ForbiddenException)
    })

    it('should return the member when found and authorized', async () => {
      const member = makeMember()
      memberRepository.findOneBy.mockResolvedValue(member)
      familyService.findOne.mockResolvedValue({ id: 'family-1' })

      const result = await service.findOne('member-1', 'user-1')

      expect(result).toEqual(member)
    })
  })

  // ─── delete ────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should soft delete the member', async () => {
      memberRepository.findOneBy.mockResolvedValue(makeMember())
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.softDelete.mockResolvedValue(undefined)

      await service.delete('member-1', 'user-1')

      expect(memberRepository.softDelete).toHaveBeenCalledWith('member-1')
    })

    it('should propagate NotFoundException from findOne when member not found', async () => {
      memberRepository.findOneBy.mockResolvedValue(null)

      await expect(service.delete('member-1', 'user-1')).rejects.toThrow(NotFoundException)
    })
  })

  // ─── findOneDetailed ───────────────────────────────────────────────────────

  describe('findOneDetailed', () => {
    it('should throw NotFoundException when member is not found in the tree', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(null)

      await expect(service.findOneDetailed('family-1', 'member-1', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('should return a DetailedPersonDto with minimal fields', async () => {
      const member = makeMember({ birthDate: new Date('1990-01-01') })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(member)

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
      memberRepository.findOne.mockResolvedValue(member)

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.location).toEqual({ nationality: 'ID', hometown: 'Jakarta', domicile: 'Bandung' })
    })

    it('should include contact when phoneNumber is present', async () => {
      const member = makeMember({ phoneNumber: '+628123456789', homeNumber: null })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(member)

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.contact).toEqual({ phoneNumber: '+628123456789', homeNumber: null })
    })

    it('should include occupation when occupation fields are present', async () => {
      const member = makeMember({ occupation: 'Engineer', officeAddress: 'Jl. Merdeka 1' })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(member)

      const result = await service.findOneDetailed('family-1', 'member-1', 'user-1')

      expect(result.occupation).toEqual({ occupation: 'Engineer', officeAddress: 'Jl. Merdeka 1' })
    })

    it('should include deathDate timestamp when deathDate is set', async () => {
      const member = makeMember({ deathDate: new Date('2020-06-15') })
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(member)

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

    it('should throw ConflictException when member not found in tree', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(null)

      await expect(service.updateDetailed('family-1', 'member-1', patchDto, 'user-1')).rejects.toThrow(ConflictException)
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
      // findOne for finding member first, then for findOneDetailed call
      memberRepository.findOne.mockResolvedValueOnce(member).mockResolvedValueOnce(updatedMember)
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

    it('should throw ConflictException when member not found in tree', async () => {
      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(null)

      await expect(service.updateMemberImage('family-1', 'member-1', mockFile, 'user-1')).rejects.toThrow(ConflictException)
    })

    it('should upload image and update member image URLs', async () => {
      const member = makeMember()
      const uploadResult = { fullImageUrl: 'https://cdn.example.com/full.jpg', imageThumbnailUrl: 'https://cdn.example.com/thumb.jpg' }

      familyService.findOne.mockResolvedValue({ id: 'family-1' })
      memberRepository.findOne.mockResolvedValue(member)
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
