import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FamiliesModule } from './families/families.module';
import { MembersModule } from './members/members.module';
import { TypeOrmModule } from '@nestjs/typeorm';
require('dotenv').config();

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'family-tree',
      host: process.env["DB_HOST"],
      port: Number(process.env["DB_PORT"]) || 5432,
      username: process.env["DB_USERNAME"],
      password: process.env["DB_PASSWORD"],
      autoLoadEntities: true,
      synchronize: true,
    }), FamiliesModule, MembersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
