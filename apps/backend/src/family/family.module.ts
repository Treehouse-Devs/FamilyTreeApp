import { Module } from '@nestjs/common'
import { FamilyController } from './family.controller'
import { FamilyService } from './family.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Family } from './entities/family.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Family])],
  controllers: [FamilyController],
  providers: [FamilyService],
})
export class FamilyModule {}
