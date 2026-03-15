import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { FamilyMember, Gender } from './entities/family-member.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { CreateFamilyMemberDto } from '@myorg/dto/member/create-family-member.dto'
import { FamilyService } from 'src/family/family.service'
import { UpdateFamilyMemberDto } from '@myorg/dto/member/update-family-member-dto'
import { FamilyRelationship, RelationType } from './entities/family-relationship.entity'

@Injectable()
export class MemberService {
  constructor(
        @InjectRepository(FamilyMember) private readonly memberRepository: Repository<FamilyMember>,
        @InjectRepository(FamilyRelationship) private readonly relationshipRepository: Repository<FamilyRelationship>,
        @InjectDataSource() private dataSource: DataSource,
        private familyService: FamilyService,
  ) {}

  async create(createFamilyMemberDto: CreateFamilyMemberDto, userId: string): Promise<FamilyMember> {
    const family = await this.familyService.findOne(createFamilyMemberDto.familyId, userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }

    const { familyId, fullName, gender, birthDate, deathDate, relatedMemberId, relationType } = createFamilyMemberDto

    // TODO: use Gender enum on CreateFamilyMemberDto
    let dtoGender: Gender
    if (gender == 'male') {
      dtoGender = Gender.MALE
    }
    else {
      dtoGender = Gender.FEMALE
    }

    return await this.dataSource.transaction(async (manager) => {
      const member = manager.create(FamilyMember, { familyId, fullName, gender: dtoGender, birthDate, deathDate })
      await manager.save(FamilyMember, member)

      const memberCount = await manager.count(FamilyMember, { where: { familyId } })
      const hasRelationship = relatedMemberId && relationType
      if (memberCount > 1 && !hasRelationship) {
        throw new BadRequestException('Relationship must exist')
      }

      if (hasRelationship) {
        // TODO: Use RelationType enum on DTO
        const relatedMember = await manager.findOne(FamilyMember, { where: { id: relatedMemberId } })
        if (!relatedMember) {
          throw new BadRequestException('Related member not found!')
        }

        const relationTypeParsed = relationType === 'PARENT' ? RelationType.PARENT : RelationType.SPOUSE
        const relationship = manager.create(FamilyRelationship, { familyId, sourceMemberId: relatedMemberId, targetMemberId: member.id, relationType: relationTypeParsed })
        await manager.save(FamilyRelationship, relationship)
      }
      return member
    })
  }

  async findOne(id: string, userId: string): Promise<FamilyMember> {
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

  async update(id: string, updateFamilyMemberDto: UpdateFamilyMemberDto, userId: string): Promise<FamilyMember | null> {
    const { fullName, birthDate, deathDate } = updateFamilyMemberDto
    const gender = updateFamilyMemberDto.gender === 'male' ? Gender.MALE : Gender.FEMALE

    await this.findOne(id, userId)

    await this.memberRepository.update(id, { fullName, gender, birthDate, deathDate })

    return await this.memberRepository.findOneBy({ id })
  }

  async delete(id: string, userId: string): Promise<void> {
    const member = await this.findOne(id, userId)

    const totalFamilyMembers = await this.memberRepository.count({ where: { familyId: member.familyId } })
    if (totalFamilyMembers <= 1) {
      throw new ConflictException('Cannot delete the last member of a family')
    }

    await this.memberRepository.softDelete(id)
  }
}
