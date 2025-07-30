import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { FamilyMember, Gender } from './entities/family-member.entity'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { CreateFamilyMemberDto } from '@myorg/dto/member/create-family-member.dto'
import { FamilyService } from 'src/family/family.service'
import { UpdateFamilyMemberDto } from '@myorg/dto/member/update-family-member-dto'

@Injectable()
export class MemberService {
  constructor(
        @InjectRepository(FamilyMember) private readonly memberRepository: Repository<FamilyMember>,
        @InjectDataSource() private dataSource: DataSource,
        private familyService: FamilyService,
  ) {}

  async create(createFamilyMemberDto: CreateFamilyMemberDto, userId: string): Promise<FamilyMember> {
    const family = await this.familyService.findOne(createFamilyMemberDto.familyId, userId)
    if (!family) {
      throw new ForbiddenException('This family is not belong to this user')
    }
    // TODO: Wrap with transaction
    const { familyId, fullName, gender, birthDate, deathDate } = createFamilyMemberDto

    // TODO: use Gender enum on CreateFamilyMemberDto
    let dtoGender: Gender
    if (gender == 'male') {
      dtoGender = Gender.MALE
    }
    else {
      dtoGender = Gender.FEMALE
    }

    const member = this.memberRepository.create({ familyId, fullName, gender: dtoGender, birthDate, deathDate })
    await this.memberRepository.save(member)

    // TODO: Check if there any relationship on dto
    // will implement when relationship module is ready

    return member
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

  async update(id: string, updateFamilyMemberDto: UpdateFamilyMemberDto, userId: string): Promise<FamilyMember | null> {
    const { fullName, birthDate, deathDate } = updateFamilyMemberDto
    const gender = updateFamilyMemberDto.gender === 'male' ? Gender.MALE : Gender.FEMALE

    await this.findOne(id, userId)

    await this.memberRepository.update(id, { fullName, gender, birthDate, deathDate })

    return await this.memberRepository.findOneBy({ id })
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId)

    await this.memberRepository.softDelete(id)
  }
}
