import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import * as firebaseAdmin from 'firebase-admin'
import { getJwtSecret, JWT_ALGORITHM } from './jwt.config'

interface JwtPayload {
  email: string
  uid: string
  displayName?: string
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getJwtSecret(),
      algorithms: [JWT_ALGORITHM],
    })
  }

  async validate(payload: JwtPayload) {
    try {
      await firebaseAdmin.auth().getUserByEmail(payload.email)

      return payload
    } catch {
      throw new UnauthorizedException('Invalid user')
    }
  }
}
