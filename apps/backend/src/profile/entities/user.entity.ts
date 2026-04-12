import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { UserGender } from '@treely/dto/profile/user-gender.enum'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 128, nullable: false })
  firebaseUid!: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string

  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null

  @Column({ type: 'bigint', nullable: false })
  birthDate!: number

  @Column({ type: 'enum', enum: UserGender, nullable: false })
  gender!: UserGender

  @Column({ type: 'varchar', default: 'en' })
  language!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
