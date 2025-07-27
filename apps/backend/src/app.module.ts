import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { MembersModule } from './members/members.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { typeOrmConfig } from './config/database.config'
import { UserModule } from './user/user.module'
import configuration from './config/configuration'
import { LoggerMiddleware } from './logger/logger.middleware'
import { MailerModule } from './mailer/mailer.module'
import { FamilyModule } from './family/family.module'

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
    FamilyModule,
    MembersModule,
    UserModule,
    MailerModule,
    FamilyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
