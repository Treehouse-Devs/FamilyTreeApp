import { Module } from "@nestjs/common";
import { FamiliesModule } from "./families/families.module";
import { MembersModule } from "./members/members.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { typeOrmConfig } from "./config/database.config";
import { UserModule } from "./user/user.module";
import configuration from "./config/configuration";

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
    FamiliesModule,
    MembersModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
