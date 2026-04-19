import { Module } from '@nestjs/common'
import { FamilyService } from './family.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { FamilyMember } from 'src/member/entities/family-member.entity'
import { FamilyRelationship } from 'src/member/entities/family-relationship.entity'
import { User } from 'src/profile/entities/user.entity'
import { StorageModule } from 'src/storage/storage.module'
import { FamilyController } from './family.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Family, FamilyMember, FamilyRelationship, User]), StorageModule],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule { }
