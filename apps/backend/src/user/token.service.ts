import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UserFromToken } from './user.types';

@Injectable()
export class TokenService {
  private refreshTokensStore: {
    [userId: string]: { token: string; expiredAt: number }
  } = {};

  constructor(private jwtService: JwtService) {}

  createAndStoreRefreshToken(userId: string) {
    const refreshToken = uuidv4();
    const refreshTokenExpiredAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
    this.refreshTokensStore[userId] = { token: refreshToken, expiredAt: refreshTokenExpiredAt };
    return { refreshToken, refreshTokenExpiredAt };
  }

  createJwtTokens(userRecord: UserFromToken) {
    const payload = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    };
    const accessToken = this.jwtService.sign(payload);
    const expiredAt = Math.floor(Date.now() / 1000) + 3600;
    const { refreshToken, refreshTokenExpiredAt } = this.createAndStoreRefreshToken(userRecord.uid);
    return { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt };
  }

  validateRefreshToken(uid: string, refreshToken: string) {
    const stored = this.refreshTokensStore[uid];
    const now = Math.floor(Date.now() / 1000);
    if (!stored || stored.token !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (stored.expiredAt < now) {
      delete this.refreshTokensStore[uid];
      throw new UnauthorizedException('Refresh token expired');
    }
    return stored;
  }

  deleteRefreshToken(uid: string) {
    delete this.refreshTokensStore[uid];
  }
} 