import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

/**
 * A single issued refresh token.
 *
 * We never store the raw token: only a SHA-256 hash of it. If the database
 * leaks, the stored hashes cannot be replayed against the refresh endpoint.
 * Rotation marks the old row as `revoked` instead of deleting it, so a later
 * attempt to reuse a rotated token can be detected as theft.
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column({ type: 'varchar', length: 128, nullable: false })
  userId!: string

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, nullable: false })
  tokenHash!: string

  /** Unix timestamp (seconds) when this token expires. */
  @Column({ type: 'bigint', nullable: false })
  expiredAt!: number

  /** Set when the token has been rotated out or explicitly invalidated. */
  @Column({ type: 'boolean', default: false })
  revoked!: boolean

  @CreateDateColumn()
  createdAt!: Date
}
