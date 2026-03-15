import { ConflictException, Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { DataSource, ILike, Repository } from 'typeorm'
import { CreateFamilyDto } from '@myorg/dto/family/create-family.dto'
import { UpdateFamilyDto } from '@myorg/dto/family/update-family.dto'
import { FamilyMember } from 'src/member/entities/family-member.entity'

@Injectable()
export class FamilyService {
  constructor(
        @InjectRepository(Family)
        private readonly familyRepo: Repository<Family>,
        @InjectDataSource() private dataSource: DataSource,
  ) {}

  async create(createFamilyDto: CreateFamilyDto) {
    const family = this.familyRepo.create(createFamilyDto)
    return await this.familyRepo.save(family)
  }

  async findAll(search: string, userId: string) {
    return await this.familyRepo.find({ where: { createdByUid: userId, name: ILike(`%${search}%`) } })
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

    await this.dataSource.transaction(async (manager) => {
      await manager.softDelete(FamilyMember, { familyId: id })
      await manager.softDelete(Family, { id })
    })
  }
}
