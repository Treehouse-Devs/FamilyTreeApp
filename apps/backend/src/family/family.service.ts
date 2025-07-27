import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { Repository } from 'typeorm'
import { CreateFamilyDto } from '@myorg/dto/family/create-family.dto'
import { UpdateFamilyDto } from '@myorg/dto/family/update-family.dto'

@Injectable()
export class FamilyService {
  constructor(
        @InjectRepository(Family)
        private readonly familyRepo: Repository<Family>,
  ) {}

  async create(createFamilyDto: CreateFamilyDto) {
    const family = this.familyRepo.create(createFamilyDto)
    return await this.familyRepo.save(family)
  }

  async findAll(userId: string) {
    return await this.familyRepo.findBy({ createdByUid: userId })
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

    await this.familyRepo.delete(id)
  }
}
