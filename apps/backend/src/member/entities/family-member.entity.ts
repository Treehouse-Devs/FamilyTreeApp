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

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
