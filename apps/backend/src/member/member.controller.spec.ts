import { Test, TestingModule } from '@nestjs/testing'
import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { BadRequestException } from '@nestjs/common'
import { Gender, DetailedPersonDto, UploadMemberImageResponseDto } from '@treely/dto/index'
import { UserFromToken } from 'src/auth/auth.types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockUser: UserFromToken = { uid: 'user-1', email: 'test@example.com' }

function makeDetailedPerson(overrides: Partial<DetailedPersonDto> = {}): DetailedPersonDto {
  return {
    id: 'member-1',
    name: 'John Doe',
    gender: Gender.MALE,
    birthDate: new Date('1990-01-01').getTime(),
    deathDate: undefined,
    imageThumbnailUrl: undefined,
    fullImageUrl: undefined,
    location: undefined,
    contact: undefined,
    occupation: undefined,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MemberController', () => {
  let controller: MemberController

  const memberService = {
    findOneDetailed: jest.fn(),
    updateDetailed: jest.fn(),
    updateMemberImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [{ provide: MemberService, useValue: memberService }],
    }).compile()

    controller = module.get<MemberController>(MemberController)
    jest.clearAllMocks()
  })

  // ─── getPerson ─────────────────────────────────────────────────────────────

  describe('getPerson', () => {
    it('should return the person wrapped in a { person } object', async () => {
      const person = makeDetailedPerson()
      memberService.findOneDetailed.mockResolvedValue(person)

      const result = await controller.getPerson('family-1', 'member-1', mockUser)

      expect(memberService.findOneDetailed).toHaveBeenCalledWith('family-1', 'member-1', 'user-1')
      expect(result).toEqual({ person })
    })

    it('should propagate errors thrown by MemberService', async () => {
      memberService.findOneDetailed.mockRejectedValue(new BadRequestException('not found'))

      await expect(controller.getPerson('family-1', 'member-1', mockUser)).rejects.toThrow(BadRequestException)
    })
  })

  // ─── patchPerson ───────────────────────────────────────────────────────────

  describe('patchPerson', () => {
    const patchDto = { name: 'Jane Updated', gender: 'female' as const }

    it('should return the updated person wrapped in a { person } object', async () => {
      const updatedPerson = makeDetailedPerson({ name: 'Jane Updated', gender: 'female' })
      memberService.updateDetailed.mockResolvedValue(updatedPerson)

      const result = await controller.patchPerson('family-1', 'member-1', patchDto, mockUser)

      expect(memberService.updateDetailed).toHaveBeenCalledWith('family-1', 'member-1', patchDto, 'user-1')
      expect(result).toEqual({ person: updatedPerson })
    })

    it('should propagate errors thrown by MemberService', async () => {
      memberService.updateDetailed.mockRejectedValue(new BadRequestException('validation failed'))

      await expect(controller.patchPerson('family-1', 'member-1', patchDto, mockUser)).rejects.toThrow(BadRequestException)
    })
  })

  // ─── uploadPersonImage ─────────────────────────────────────────────────────

  describe('uploadPersonImage', () => {
    const mockFile = {
      fieldname: 'file',
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from(''),
      size: 1024,
    } as Express.Multer.File

    it('should throw BadRequestException when no file is uploaded', async () => {
      const noFile = undefined as unknown as Express.Multer.File
      await expect(
        controller.uploadPersonImage('family-1', 'member-1', noFile, mockUser),
      ).rejects.toThrow(BadRequestException)

      expect(memberService.updateMemberImage).not.toHaveBeenCalled()
    })

    it('should upload the image and return the result', async () => {
      const uploadResult: UploadMemberImageResponseDto = {
        fullImageUrl: 'https://cdn.example.com/full.jpg',
        imageThumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      }
      memberService.updateMemberImage.mockResolvedValue(uploadResult)

      const result = await controller.uploadPersonImage('family-1', 'member-1', mockFile, mockUser)

      expect(memberService.updateMemberImage).toHaveBeenCalledWith('family-1', 'member-1', mockFile, 'user-1')
      expect(result).toEqual(uploadResult)
    })

    it('should propagate errors thrown by MemberService', async () => {
      memberService.updateMemberImage.mockRejectedValue(new BadRequestException('upload failed'))

      await expect(controller.uploadPersonImage('family-1', 'member-1', mockFile, mockUser)).rejects.toThrow(BadRequestException)
    })
  })
})
