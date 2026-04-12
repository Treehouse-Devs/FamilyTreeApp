import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import * as path from 'path'
import { typeOrmConfig } from './config/database.config'
import { AuthModule } from './auth/auth.module'
import configuration from './config/configuration'
import { LoggerMiddleware } from './logger/logger.middleware'
import { MailerModule } from './mailer/mailer.module'
import { FamilyModule } from './family/family.module'
import { MemberModule } from './member/member.module'
import { ProfileModule } from './profile/profile.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        typeOrmConfig(configService),
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    FamilyModule,
    MemberModule,
    ProfileModule,
    AuthModule,
    MailerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
