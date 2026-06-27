import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { UserFromToken } from './auth.types'
import { RefreshToken } from './entities/refresh-token.entity'
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_TOKEN_TTL_SECONDS } from './jwt.config'

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) { }

  private nowInSeconds(): number {
    return Math.floor(Date.now() / 1000)
  }

  /** Refresh tokens are high-entropy random values, so a fast SHA-256 hash is sufficient. */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  async createAndStoreRefreshToken(userId: string) {
    const refreshToken = uuidv4()
    const refreshTokenExpiredAt = this.nowInSeconds() + REFRESH_TOKEN_TTL_SECONDS

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiredAt: refreshTokenExpiredAt,
      }),
    )

    return { refreshToken, refreshTokenExpiredAt }
  }

  signAccessToken(userRecord: UserFromToken) {
    const payload = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    }
    const accessToken = this.jwtService.sign(payload)
    const expiredAt = this.nowInSeconds() + ACCESS_TOKEN_TTL_SECONDS

    return { accessToken, expiredAt }
  }

  async createJwtTokens(userRecord: UserFromToken) {
    const { accessToken, expiredAt } = this.signAccessToken(userRecord)
    const { refreshToken, refreshTokenExpiredAt } = await this.createAndStoreRefreshToken(userRecord.uid)

    return { accessToken, expiredAt, refreshToken, refreshTokenExpiredAt }
  }

  /**
   * Validates a refresh token and rotates it: the presented token is revoked and a
   * brand-new one is issued. Presenting an already-revoked token is treated as theft,
   * and every refresh token for that user is invalidated.
   */
  async rotateRefreshToken(uid: string, refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken)
    const stored = await this.refreshTokenRepository.findOne({ where: { userId: uid, tokenHash } })

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (stored.revoked) {
      // The token was already rotated out but is being presented again -> likely stolen.
      await this.refreshTokenRepository.update({ userId: uid }, { revoked: true })
      throw new UnauthorizedException('Refresh token reuse detected')
    }

    if (Number(stored.expiredAt) < this.nowInSeconds()) {
      await this.refreshTokenRepository.delete({ id: stored.id })
      throw new UnauthorizedException('Refresh token expired')
    }

    stored.revoked = true
    await this.refreshTokenRepository.save(stored)

    return this.createAndStoreRefreshToken(uid)
  }

  async revokeAllForUser(uid: string) {
    await this.refreshTokenRepository.delete({ userId: uid })
  }
}
