import { Module } from '@nestjs/common'
import { MemberController } from './member.controller'
import { MemberService } from './member.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FamilyMember } from './entities/family-member.entity'
import { FamilyModule } from 'src/family/family.module'

@Module({
  imports: [TypeOrmModule.forFeature([FamilyMember]), FamilyModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
