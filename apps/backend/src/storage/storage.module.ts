import { Module } from '@nestjs/common'
import { StorageService } from './storage.service'
import { LocalStorageService } from './local-storage.service'
import { FirebaseStorageService } from './firebase-storage.service'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: StorageService,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('STORAGE_PROVIDER') ?? 'local'

        return provider === 'firebase' ? new FirebaseStorageService(configService) : new LocalStorageService(configService)
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule { }
