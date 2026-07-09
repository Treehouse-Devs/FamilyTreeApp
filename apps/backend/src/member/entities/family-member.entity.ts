import { Gender } from '@treely/dto/index'
import { Family } from '../../family/entities/family.entity'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Family, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family!: Family

  @Column()
  familyId!: string

  @Column({ nullable: true })
  fatherId!: string | null

  @ManyToOne(() => FamilyMember, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fatherId' })
  father!: FamilyMember | null

  @Column({ nullable: true })
  motherId!: string | null

  @ManyToOne(() => FamilyMember, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'motherId' })
  mother!: FamilyMember | null

  @Column({ nullable: true })
  spouseId!: string | null

  @OneToOne(() => FamilyMember, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'spouseId' })
  spouse!: FamilyMember | null

  @Column({ type: 'varchar', length: 100, nullable: false })
  fullName!: string

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender!: Gender

  @Column({ type: 'bigint', nullable: true })
  birthDate!: number | null

  @Column({ type: 'bigint', nullable: true })
  deathDate!: number

  @Column({ type: 'int', nullable: true })
  birthOrder!: number | null

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
  @Column({ type: 'varchar', nullable: true })
  phoneNumber!: string | null

  @Column({ type: 'varchar', nullable: true })
  homeNumber!: string | null

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
