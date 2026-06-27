import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt-auth.guard'
import { FirebaseService } from './firebase.service'
import { TokenService } from './token.service'
import { MailerService } from 'src/mailer/mailer.service'
import { ProfileModule } from 'src/profile/profile.module'
import { RefreshToken } from './entities/refresh-token.entity'
import { getJwtSecret, JWT_ALGORITHM } from './jwt.config'

@Module({
  imports: [
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: '1h', algorithm: JWT_ALGORITHM },
    }),
    TypeOrmModule.forFeature([RefreshToken]),
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, FirebaseService, TokenService, MailerService],
  exports: [AuthService],
})
export class AuthModule { }
