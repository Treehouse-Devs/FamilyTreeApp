import { Module, forwardRef } from '@nestjs/common'
import { FamilyController } from './family.controller'
import { FamilyService } from './family.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'
import { MemberModule } from 'src/member/member.module'

@Module({
  imports: [TypeOrmModule.forFeature([Family]), forwardRef(() => MemberModule)],
  controllers: [FamilyController],
  providers: [FamilyService],
  exports: [FamilyService],
})
export class FamilyModule {}
