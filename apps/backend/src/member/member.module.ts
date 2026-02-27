import { Module } from '@nestjs/common'
import { MemberService } from './member.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FamilyMember } from './entities/family-member.entity'
import { FamilyModule } from 'src/family/family.module'
import { FamilyRelationship } from './entities/family-relationship.entity'
import { MemberController } from './member.controller'
import { StorageModule } from 'src/storage/storage.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([FamilyMember, FamilyRelationship]),
    FamilyModule,
    StorageModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
