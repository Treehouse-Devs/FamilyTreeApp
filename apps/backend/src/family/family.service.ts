import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { ILike, Repository } from 'typeorm'
import { CreateFamilyDto } from '@treelys/dto/family/create-family.dto'
import { UpdateFamilyDto } from '@treely/dto/family/update-family.dto'

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(Family)
    private readonly familyRepo: Repository<Family>,
  ) { }

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

    await this.familyRepo.softDelete(id)
  }
}
