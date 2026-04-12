import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { User } from './entities/user.entity'
import { StorageModule } from 'src/storage/storage.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    StorageModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
