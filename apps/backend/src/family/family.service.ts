import { ConflictException, Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { DataSource, ILike, Repository } from 'typeorm'
import { CreateFamilyDto } from '@myorg/dto/family/create-family.dto'
import { UpdateFamilyDto } from '@myorg/dto/family/update-family.dto'
import { UserFromToken } from 'src/user/user.types'
import { MemberService } from 'src/member/member.service'
import { FamilyMemberNodeDto, FamilyTreeResponseDto } from '@myorg/dto/family/family-tree.dto'
import { FamilyMember } from 'src/member/entities/family-member.entity'
import { RelationType } from 'src/member/entities/family-relationship.entity'

@Injectable()
export class FamilyService {
  constructor(
        @InjectRepository(Family) private readonly familyRepo: Repository<Family>,
        @InjectDataSource() private dataSource: DataSource,
        @Inject(forwardRef(() => MemberService)) private familyMemberService: MemberService,
  ) {}

  async create(createFamilyDto: CreateFamilyDto, user: UserFromToken): Promise<Family | undefined> {
    const family = this.familyRepo.create(createFamilyDto)
    await this.familyRepo.save(family)

    const date = new Date()
    const birthDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    try {
      await this.familyMemberService.create({ familyId: family.id, fullName: user.displayName ?? '', gender: 'male', birthDate }, user.uid)
      return family
    }
    catch (error) {
      await this.familyRepo.delete(family.id)
      throw new InternalServerErrorException(error)
    }
  }

  async findAll(search: string, userId: string): Promise<Family[] | undefined> {
    return await this.familyRepo.find({ where: { createdByUid: userId, name: ILike(`%${search}%`) } })
  }

  async findOne(id: string, userId: string): Promise<Family | undefined> {
    const family = await this.familyRepo.findOneBy({ id, createdByUid: userId })

    if (!family) {
      throw new ConflictException('Family not found')
    }

    return family
  }

  async getFamilyTree(id: string, userId: string): Promise<FamilyTreeResponseDto> {
    const family = await this.findOne(id, userId)

    const members = await this.familyMemberService.findByFamilyId(id)

    const memberMap = new Map<string, FamilyMember>(members.map(m => [m.id, m]))

    const root = members.find(m => !m.incomingRelations.some(r => r.relationType === RelationType.PARENT))
    if (!root) {
      throw new ConflictException('No root member found')
    }

    const buildNode = (member: FamilyMember): FamilyMemberNodeDto => {
      const childrenRels = member.outgoingRelations.filter(
        r => r.relationType === RelationType.PARENT,
      )
      const children = childrenRels.map(rel =>
        buildNode(memberMap.get(rel.targetMemberId)!),
      )

      const spouseRel = member.outgoingRelations.find(
        r => r.relationType === RelationType.SPOUSE,
      )
      const spouse = spouseRel
        ? buildNode(memberMap.get(spouseRel.targetMemberId)!)
        : null

      return {
        id: member.id,
        name: member.fullName,
        birthDate: member.birthDate,
        deathDate: member.deathDate ?? null,
        children,
        spouse,
      }
    }

    return {
      tree: {
        id: family?.id ?? '',
        name: family?.name ?? '',
        createdAt: family?.createdAt ?? new Date(),
        updatedAt: family?.updatedAt ?? new Date(),
        root: buildNode(root),
      },
    }
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto, userId: string): Promise<Family | null> {
    await this.findOne(id, userId)

    await this.familyRepo.update(id, updateFamilyDto)

    return await this.familyRepo.findOneBy({ id })
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId)

    await this.familyRepo.softDelete(id)
  }
}
