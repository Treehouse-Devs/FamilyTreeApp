import { Module, forwardRef } from '@nestjs/common'
import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FamilyMember } from './entities/family-member.entity'
import { FamilyModule } from 'src/family/family.module'
import { FamilyRelationship } from './entities/family-relationship.entity'

@Module({
  imports: [TypeOrmModule.forFeature([FamilyMember, FamilyRelationship]), forwardRef(() => FamilyModule)],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
