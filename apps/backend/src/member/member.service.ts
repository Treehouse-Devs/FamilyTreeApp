import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { FamilyMember } from './entities/family-member.entity'
import { Family } from 'src/family/entities/family.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { FamilyService } from 'src/family/family.service'
import { CreateFamilyMemberDto, DetailedPersonDto, PatchFamilyMemberDto, PersonDto, UploadMemberImageResponseDto } from '@treely/dto'
import { StorageService } from 'src/storage/storage.service'
import { mapMemberToPersonDto } from './member.util'

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(FamilyMember) private readonly memberRepository: Repository<FamilyMember>,
    private familyService: FamilyService,
    private storageService: StorageService,
  ) { }

  async create(createFamilyMemberDto: CreateFamilyMemberDto, familyId: string, userId: string): Promise<PersonDto> {
    const family = await this.familyService.findOne(familyId, userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }

    const { name, gender, birthDate, birthOrder, deathDate, isBloodRelated, spouseId, fatherId, motherId } = createFamilyMemberDto

    return await this.memberRepository.manager.transaction(async (manager) => {
      const member = manager.create(FamilyMember, {
        familyId,
        fullName: name,
        gender: gender,
        birthDate: birthDate ?? null,
        birthOrder: birthOrder ?? null,
        deathDate,
        isBloodRelated: isBloodRelated,
        fatherId: fatherId ?? null,
        motherId: motherId ?? null,
        spouseId: spouseId ?? null,
      })

      await manager.save(member)

      // Sync the other side of the spouse link
      if (spouseId) {
        await manager.update(FamilyMember, { id: spouseId }, { spouseId: member.id })
      }

      return mapMemberToPersonDto(member)
    })
  }

  async findOne(treeId: string, personId: string, userId: string): Promise<FamilyMember> {
    const family = await this.familyService.findOne(treeId, userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }

    const member = await this.memberRepository.findOneBy({ id: personId })
    if (!member) {
      throw new NotFoundException('Member not found')
    }

    return member
  }

  async delete(treeId: string, personId: string, userId: string): Promise<void> {
    const member = await this.findOne(treeId, personId, userId)

    await this.memberRepository.manager.transaction(async (manager) => {
      // Unlink spouse before soft delete
      if (member.spouseId) {
        await manager.update(FamilyMember, { id: member.spouseId }, { spouseId: null })
      }

      // Orphan children — nullify their parent references pointing to this member
      await manager.update(FamilyMember, { fatherId: member.id }, { fatherId: null })
      await manager.update(FamilyMember, { motherId: member.id }, { motherId: null })

      // If this member was the family's designated root, clear it so getTree's fallback
      // picks a new top-level root (e.g. one of the now-orphaned children).
      await manager.update(Family, { id: member.familyId, rootId: member.id }, { rootId: null })

      await manager.softDelete(FamilyMember, member.id)
    })
  }

  async findOneDetailed(treeId: string, personId: string, userId: string): Promise<DetailedPersonDto> {
    const member = await this.findOne(treeId, personId, userId)

    const children = await this.memberRepository.find({
      where: [{ fatherId: personId }, { motherId: personId }],
    })

    return {
      id: member.id,
      name: member.fullName,
      spouseId: member.spouseId ?? undefined,
      spouse: member.spouse ? mapMemberToPersonDto(member.spouse) : undefined,
      children: children.map(mapMemberToPersonDto),
      birthDate: member.birthDate != null ? Number(member.birthDate) : undefined,
      birthOrder: member.birthOrder ?? undefined,
      isBloodRelated: member.isBloodRelated,
      gender: member.gender,
      deathDate: member.deathDate ? member.deathDate : undefined,
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
    await this.findOne(treeId, personId, userId)

    await this.memberRepository.update(personId, {
      ...(dto.name && { fullName: dto.name }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.birthDate !== undefined && { birthDate: dto.birthDate }),
      ...(dto.birthOrder !== undefined && { birthOrder: dto.birthOrder }),
      ...(dto.deathDate !== undefined && { deathDate: dto.deathDate }),
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
    await this.findOne(treeId, personId, userId)

    const result = await this.storageService.uploadMemberImage(personId, file)

    await this.memberRepository.update(personId, {
      fullImageUrl: result.fullImageUrl,
      imageThumbnailUrl: result.imageThumbnailUrl,
    })

    return result
  }
}
