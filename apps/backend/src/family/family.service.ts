import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { DataSource, ILike, Repository } from 'typeorm'
import { CreateFamilyDto } from '@treely/dto/family/create-family.dto'
import { UpdateFamilyDto } from '@treely/dto/family/update-family.dto'
import { FamilyMember } from 'src/member/entities/family-member.entity'
import { FamilyRelationship } from 'src/member/entities/family-relationship.entity'
import { UserFromToken } from 'src/auth/auth.types'
import { User } from 'src/profile/entities/user.entity'
import { StorageService } from 'src/storage/storage.service'
import { RelationType, Gender } from '@treely/dto'
import type { UploadFamilyImageResponseDto } from '@treely/dto/family/family-response.dto'
import type { FlatPersonDto, FlatTreeDto } from '@treely/dto/family/family-response.dto'

@Injectable()
export class FamilyService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepo: Repository<FamilyMember>,
    @InjectRepository(FamilyRelationship)
    private readonly relationshipRepo: Repository<FamilyRelationship>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly storageService: StorageService,
  ) { }

  async create(createFamilyDto: CreateFamilyDto, user: UserFromToken): Promise<FlatTreeDto> {
    const family = this.familyRepo.create({ ...createFamilyDto, createdByUid: user.uid })
    const profile = await this.userRepo.findOneBy({ firebaseUid: user.uid })

    if (!profile) {
      throw new NotFoundException('User profile not found')
    }

    const savedFamily = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(family)

      // Create a default member for the family
      const defaultMember = this.familyMemberRepo.create({
        familyId: saved.id,
        fullName: profile.name,
        birthDate: new Date(Number(profile.birthDate)),
        gender: profile.gender,
      })
      await manager.save(defaultMember)

      return saved
    })

    return this.getTree(savedFamily.id, user.uid)
  }

  async findAll(search: string, userId: string) {
    return await this.familyRepo.find({ where: { createdByUid: userId, name: ILike(`%${search ?? ''}%`) } })
  }

  async findOne(id: string, userId: string) {
    const family = await this.familyRepo.findOneBy({ id, createdByUid: userId })

    if (!family) {
      throw new ConflictException('Family not found')
    }

    return family
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto, userId: string) {
    await this.findOne(id, userId)

    await this.familyRepo.update(id, updateFamilyDto)

    return await this.familyRepo.findOneBy({ id })
  }

  async delete(id: string, userId: string) {
    await this.findOne(id, userId)

    await this.familyRepo.softDelete(id)
  }

  async uploadFamilyImage(treeId: string, file: Express.Multer.File, userId: string): Promise<UploadFamilyImageResponseDto> {
    await this.findOne(treeId, userId)

    const result = await this.storageService.uploadFamilyImage(treeId, file)

    await this.familyRepo.update(treeId, { familyImageUrl: result.familyImageUrl })

    return result
  }

  async getTree(id: string, userId: string): Promise<FlatTreeDto> {
    const family = await this.familyRepo.findOneBy({ id, createdByUid: userId })

    if (!family) {
      throw new NotFoundException('Family not found')
    }

    const members = await this.familyMemberRepo.findBy({ familyId: id })
    const relationships = await this.relationshipRepo.findBy({ familyId: id })

    const memberMap = new Map(members.map(m => [m.id, m]))

    const persons: FlatPersonDto[] = members.map((m) => {
      const parentRels = relationships.filter(
        r => r.targetMemberId === m.id && r.relationType === RelationType.CHILD,
      )
      const spouseRel = relationships.find(
        r => r.relationType === RelationType.SPOUSE
          && (r.sourceMemberId === m.id || r.targetMemberId === m.id),
      )

      let fatherId: string | undefined
      let motherId: string | undefined
      for (const rel of parentRels) {
        const parent = memberMap.get(rel.sourceMemberId)
        if (parent?.gender === Gender.MALE) {
          fatherId = parent.id
        } else if (parent?.gender === Gender.FEMALE) {
          motherId = parent.id
        }
      }

      const spouseId = spouseRel
        ? spouseRel.sourceMemberId === m.id
          ? spouseRel.targetMemberId
          : spouseRel.sourceMemberId
        : undefined

      return {
        id: m.id,
        name: m.fullName,
        birthDate: new Date(m.birthDate).getTime(),
        isBloodRelated: m.isBloodRelated,
        gender: m.gender,
        deathDate: m.deathDate ? new Date(m.deathDate).getTime() : undefined,
        spouseId,
        fatherId,
        motherId,
        imageThumbnailUrl: m.imageThumbnailUrl ?? undefined,
      }
    })

    // Root is either stored on the family or derived as the member who is not a child of anyone
    let rootId = String(family.rootId || '')
    if (!rootId) {
      const childIds = new Set(
        relationships
          .filter(r => r.relationType === RelationType.CHILD)
          .map(r => r.targetMemberId),
      )
      rootId = members.find(m => !childIds.has(m.id))?.id ?? ''
    }

    return {
      id: family.id,
      name: family.name,
      createdAt: new Date(family.createdAt).getTime(),
      updatedAt: new Date(family.updatedAt).getTime(),
      familyImageUrl: family.familyImageUrl ? family.familyImageUrl : undefined,
      rootId,
      persons,
    }
  }
}
