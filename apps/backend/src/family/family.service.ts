import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { DataSource, ILike, Repository } from 'typeorm'
import { CreateFamilyDto } from '@treely/dto/family/create-family.dto'
import { UpdateFamilyDto } from '@treely/dto/family/update-family.dto'
import { FamilyMember } from 'src/member/entities/family-member.entity'
import { UserFromToken } from 'src/auth/auth.types'
import { User } from 'src/profile/entities/user.entity'
import { StorageService } from 'src/storage/storage.service'
import { mapMemberToFlatPersonDto } from 'src/member/member.util'
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
        birthDate: Number(profile.birthDate),
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
    const family = await this.findOne(id, userId)

    const members = await this.familyMemberRepo.findBy({ familyId: family.id })

    const persons: FlatPersonDto[] = members.map(m => mapMemberToFlatPersonDto(m))

    const rootId = family.rootId
      ?? members.find(m => !m.fatherId && !m.motherId)?.id
      ?? ''

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
