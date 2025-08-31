import { ConflictException, Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { DataSource, ILike, Repository } from 'typeorm'
import { CreateFamilyDto } from '@myorg/dto/family/create-family.dto'
import { UpdateFamilyDto } from '@myorg/dto/family/update-family.dto'
import { UserFromToken } from 'src/user/user.types'
import { MemberService } from 'src/member/member.service'

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
