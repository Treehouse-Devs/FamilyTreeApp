import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { HttpRequestModule } from "@app/http-request";
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt-auth.guard';
import { FirebaseService } from './firebase.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    HttpRequestModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, FirebaseService, TokenService],
  exports: [UserService],
})
export class UserModule {}
