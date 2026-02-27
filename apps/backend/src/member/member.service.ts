import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { FamilyMember, Gender } from './entities/family-member.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { CreateFamilyMemberDto } from '@treely/dto/member/create-family-member.dto'
import { FamilyService } from 'src/family/family.service'
import { PatchFamilyMemberDto } from '@treely/dto/member/patch-family-member-dto'
import { FamilyRelationship, RelationType } from './entities/family-relationship.entity'

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(FamilyMember) private readonly memberRepository: Repository<FamilyMember>,
    @InjectRepository(FamilyRelationship) private readonly relationshipRepository: Repository<FamilyRelationship>,
    @InjectDataSource() private dataSource: DataSource,
    private familyService: FamilyService,
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
}
