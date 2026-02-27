import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { FamilyMember, Gender } from './entities/family-member.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { FamilyService } from 'src/family/family.service'
import { CreateFamilyMemberDto, DetailedPersonDto, PatchFamilyMemberDto, UploadMemberImageResponseDto } from '@treely/dto'
import { FamilyRelationship, RelationType } from './entities/family-relationship.entity'
import { StorageService } from 'src/storage/storage.service'

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(FamilyMember) private readonly memberRepository: Repository<FamilyMember>,
    @InjectRepository(FamilyRelationship) private readonly relationshipRepository: Repository<FamilyRelationship>,
    @InjectDataSource() private dataSource: DataSource,
    private familyService: FamilyService,
    private storageService: StorageService,
  ) { }

  async create(createFamilyMemberDto: CreateFamilyMemberDto, userId: string): Promise<FamilyMember> {
    const family = await this.familyService.findOne(createFamilyMemberDto.familyId, userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }

    const { familyId, fullName, gender, birthDate, deathDate } = createFamilyMemberDto

    const dtoGender = gender === 'male' ? Gender.MALE : Gender.FEMALE

    return await this.dataSource.transaction(async (manager) => {
      const member = manager.create(FamilyMember, { familyId, fullName, gender: dtoGender, birthDate, deathDate })
      await manager.save(FamilyMember, member)

      const memberCount = await manager.count(FamilyMember, { where: { familyId } })
      console.log('member', memberCount)
      const hasRelationship = createFamilyMemberDto.relatedMemberId && createFamilyMemberDto.relationType
      console.log('membercount:', memberCount)
      if (memberCount > 1 && !hasRelationship) {
        throw new BadRequestException('Relationship must exist')
      }

      if (hasRelationship) {
        // TODO: Use RelationType enum on DTO
        const relationType = createFamilyMemberDto.relationType === 'PARENT' ? RelationType.PARENT : RelationType.SPOUSE
        const relationship = manager.create(FamilyRelationship, { familyId, sourceMemberId: createFamilyMemberDto.relatedMemberId, targetMemberId: member.id, relationType })
        await manager.save(FamilyRelationship, relationship)
      }

      return member
    })
  }

  async findOne(id: string, userId: string): Promise<FamilyMember | null> {
    const member = await this.memberRepository.findOneBy({ id })
    if (!member) {
      throw new ConflictException('member not found')
    }

    const family = await this.familyService.findOne(member?.familyId ?? '', userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }

    return member
  }

  async update(id: string, patchFamilyMemberDto: PatchFamilyMemberDto, userId: string): Promise<FamilyMember | null> {
    const { name, gender, birthDate, deathDate } = patchFamilyMemberDto

    await this.findOne(id, userId)

    await this.memberRepository.update(id, { fullName: name, gender, birthDate, deathDate })

    return await this.memberRepository.findOneBy({ id })
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId)

    await this.memberRepository.softDelete(id)
  }

  async findOneDetailed(treeId: string, personId: string, userId: string): Promise<DetailedPersonDto> {
    // Verify tree ownership
    await this.familyService.findOne(treeId, userId)

    const member = await this.memberRepository.findOne({ where: { id: personId, familyId: treeId } })
    if (!member) {
      throw new ConflictException('Member not found')
    }

    return {
      id: member.id,
      name: member.fullName,
      birthDate: member.birthDate ? new Date(member.birthDate).getTime() : 0,
      isBloodRelated: member.isBloodRelated,
      gender: member.gender,
      deathDate: member.deathDate ? new Date(member.deathDate).getTime() : undefined,
      imageThumbnailUrl: member.imageThumbnailUrl ?? undefined,
      fullImageUrl: member.fullImageUrl ?? undefined,
      location: (member.nationality || member.hometown || member.domicile)
        ? {
          nationality: member.nationality ?? '',
          hometown: member.hometown ?? '',
          domicile: member.domicile ?? '',
        }
        : undefined,
      contact: (member.phoneNumber !== null || member.homeNumber !== null)
        ? {
          phoneNumber: member.phoneNumber,
          homeNumber: member.homeNumber,
        }
        : undefined,
      occupation: (member.occupation || member.officeAddress)
        ? {
          occupation: member.occupation ?? '',
          officeAddress: member.officeAddress ?? '',
        }
        : undefined,
    }
  }

  async updateDetailed(
    treeId: string,
    personId: string,
    dto: PatchFamilyMemberDto,
    userId: string,
  ): Promise<DetailedPersonDto> {
    await this.familyService.findOne(treeId, userId)

    const member = await this.memberRepository.findOne({ where: { id: personId, familyId: treeId } })
    if (!member) {
      throw new ConflictException('Member not found')
    }

    await this.memberRepository.update(personId, {
      ...(dto.name && { fullName: dto.name }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.birthDate !== undefined && { birthDate: new Date(dto.birthDate) }),
      ...(dto.deathDate !== undefined && { deathDate: new Date(dto.deathDate) }),
      ...(dto.location?.nationality !== undefined && { nationality: dto.location.nationality }),
      ...(dto.location?.hometown !== undefined && { hometown: dto.location.hometown }),
      ...(dto.location?.domicile !== undefined && { domicile: dto.location.domicile }),
      ...(dto.contact?.phoneNumber !== undefined && { phoneNumber: dto.contact.phoneNumber }),
      ...(dto.contact?.homeNumber !== undefined && { homeNumber: dto.contact.homeNumber }),
      ...(dto.occupation?.occupation !== undefined && { occupation: dto.occupation.occupation }),
      ...(dto.occupation?.officeAddress !== undefined && { officeAddress: dto.occupation.officeAddress }),
    })

    return this.findOneDetailed(treeId, personId, userId)
  }

  async updateMemberImage(
    treeId: string,
    personId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadMemberImageResponseDto> {
    await this.familyService.findOne(treeId, userId)

    const member = await this.memberRepository.findOne({ where: { id: personId, familyId: treeId } })
    if (!member) {
      throw new ConflictException('Member not found')
    }

    const result = await this.storageService.uploadMemberImage(personId, file)

    await this.memberRepository.update(personId, {
      fullImageUrl: result.fullImageUrl,
      imageThumbnailUrl: result.imageThumbnailUrl,
    })

    return result
  }
}
