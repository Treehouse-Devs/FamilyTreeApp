import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { FamilyMember } from './entities/family-member.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { FamilyService } from 'src/family/family.service'
import { CreateFamilyMemberDto, DetailedPersonDto, PatchFamilyMemberDto, UploadMemberImageResponseDto } from '@treely/dto'
import { FamilyRelationship } from './entities/family-relationship.entity'
import { StorageService } from 'src/storage/storage.service'
import { RelationType } from '@treely/dto'
import type { FlatPersonDto } from '@treely/dto'

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(FamilyMember) private readonly memberRepository: Repository<FamilyMember>,
    @InjectDataSource() private dataSource: DataSource,
    private familyService: FamilyService,
    private storageService: StorageService,
  ) { }

  async create(createFamilyMemberDto: CreateFamilyMemberDto, familyId: string, userId: string): Promise<FlatPersonDto> {
    const family = await this.familyService.findOne(familyId, userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }

    const { name, gender, birthDate, deathDate, isBloodRelated, spouseId, fatherId, motherId } = createFamilyMemberDto

    return await this.dataSource.transaction(async (manager) => {
      const member = manager.create(FamilyMember, {
        familyId,
        fullName: name,
        gender,
        birthDate: new Date(birthDate),
        deathDate: deathDate ? new Date(deathDate) : undefined,
        isBloodRelated,
      })
      await manager.save(FamilyMember, member)

      const memberCount = await manager.count(FamilyMember, { where: { familyId } })
      const hasRelationship = spouseId || fatherId || motherId
      if (memberCount > 1 && !hasRelationship) {
        throw new BadRequestException('Relationship must exist')
      }

      if (spouseId) {
        const spouse = await manager.findOne(FamilyMember, { where: { id: spouseId, familyId } })
        if (!spouse) {
          throw new NotFoundException('Spouse member not found')
        }
        const relationship = manager.create(FamilyRelationship, {
          familyId,
          sourceMemberId: spouseId,
          targetMemberId: member.id,
          relationType: RelationType.SPOUSE,
        })
        await manager.save(FamilyRelationship, relationship)
      }

      if (fatherId) {
        const father = await manager.findOne(FamilyMember, { where: { id: fatherId, familyId } })
        if (!father) {
          throw new NotFoundException('Father member not found')
        }
        const relationship = manager.create(FamilyRelationship, {
          familyId,
          sourceMemberId: fatherId,
          targetMemberId: member.id,
          relationType: RelationType.CHILD,
        })
        await manager.save(FamilyRelationship, relationship)
      }

      if (motherId) {
        const mother = await manager.findOne(FamilyMember, { where: { id: motherId, familyId } })
        if (!mother) {
          throw new NotFoundException('Mother member not found')
        }
        const relationship = manager.create(FamilyRelationship, {
          familyId,
          sourceMemberId: motherId,
          targetMemberId: member.id,
          relationType: RelationType.CHILD,
        })
        await manager.save(FamilyRelationship, relationship)
      }

      return {
        id: member.id,
        name: member.fullName,
        birthDate: new Date(member.birthDate).getTime(),
        isBloodRelated: member.isBloodRelated,
        gender: member.gender,
        deathDate: member.deathDate ? new Date(member.deathDate).getTime() : undefined,
        spouseId,
        fatherId,
        motherId,
        imageThumbnailUrl: member.imageThumbnailUrl ?? undefined,
      }
    })
  }

  async findOne(id: string, userId: string): Promise<FamilyMember | null> {
    const member = await this.memberRepository.findOneBy({ id })
    if (!member) {
      throw new NotFoundException('Member not found')
    }

    const family = await this.familyService.findOne(member?.familyId ?? '', userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }

    return member
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
      throw new NotFoundException('Member not found')
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
