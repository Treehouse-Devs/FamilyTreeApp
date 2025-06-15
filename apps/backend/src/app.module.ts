import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FamiliesModule } from './families/families.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [FamiliesModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
