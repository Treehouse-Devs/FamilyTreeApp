import { Family } from '../../family/entities/family.entity'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Family, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family!: Family

  @Column()
  familyId!: string

  @Column({ type: 'varchar', length: 100, nullable: false })
  fullName!: string

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender!: Gender

  @Column({ type: 'date', nullable: false })
  birthDate!: Date

  @Column({ type: 'date', nullable: true })
  deathDate!: Date

  @Column({ type: 'boolean', nullable: false, default: false })
  isBloodRelated!: boolean

  @Column({ type: 'varchar', nullable: true })
  imageThumbnailUrl!: string | null

  @Column({ type: 'varchar', nullable: true })
  fullImageUrl!: string | null

  // Location fields
  @Column({ type: 'varchar', nullable: true })
  nationality!: string | null

  @Column({ type: 'varchar', nullable: true })
  hometown!: string | null

  @Column({ type: 'varchar', nullable: true })
  domicile!: string | null

  // Contact fields
  @Column({ type: 'bigint', nullable: true })
  phoneNumber!: number | null

  @Column({ type: 'bigint', nullable: true })
  homeNumber!: number | null

  // Occupation fields
  @Column({ type: 'varchar', nullable: true })
  occupation!: string | null

  @Column({ type: 'varchar', nullable: true })
  officeAddress!: string | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
