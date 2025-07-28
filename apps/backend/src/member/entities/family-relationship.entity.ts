import { Family } from '../../family/entities/family.entity'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { FamilyMember } from './family-member.entity'

export enum RelationType {
  PARENT = 'PARENT',
  SPOUSE = 'SPOUSE',
}

@Entity('family_relationships')
export class FamilyRelationship {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Family, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'familyId' })
  family!: Family

  @Column({ nullable: false })
  familyId!: string

  @ManyToOne(() => FamilyMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceMemberId' })
  sourceMember!: FamilyMember

  @Column({ nullable: false })
  sourceMemberId!: string

  @ManyToOne(() => FamilyMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetMemberId' })
  targetMember!: FamilyMember

  @Column({ nullable: false })
  targetMemberId!: string

  @Column({ type: 'enum', enum: RelationType, nullable: false })
  relationType!: RelationType

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
