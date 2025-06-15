import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FamiliesModule } from './families/families.module';

@Module({
  imports: [FamiliesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
