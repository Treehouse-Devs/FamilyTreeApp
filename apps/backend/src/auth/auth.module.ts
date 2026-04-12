import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt-auth.guard'
import { FirebaseService } from './firebase.service'
import { TokenService } from './token.service'
import { MailerService } from 'src/mailer/mailer.service'
import { ProfileModule } from 'src/profile/profile.module'

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1h' },
    }),
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, FirebaseService, TokenService, MailerService],
  exports: [AuthService],
})
export class AuthModule { }
