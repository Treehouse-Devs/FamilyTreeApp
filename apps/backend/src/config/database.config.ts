import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {  
  return ({
    type: 'postgres',
    host: configService.get<string>('config.db.host'),
    port: configService.get<number>('config.db.port'),
    username: configService.get<string>('config.db.username'),
    password: configService.get<string>('config.db.password'),
    database: configService.get<string>('config.db.database'),
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('config.db.synchronize'), // disable in production
  });
}   
