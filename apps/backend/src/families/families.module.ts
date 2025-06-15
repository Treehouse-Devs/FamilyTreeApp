import { Module } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';

@Module({
  providers: [FamiliesService],
  controllers: [FamiliesController]
})
export class FamiliesModule {}
