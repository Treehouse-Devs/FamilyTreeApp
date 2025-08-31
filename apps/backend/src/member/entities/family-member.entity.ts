import { Family } from '../../family/entities/family.entity'
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { FamilyRelationship } from './family-relationship.entity'

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

  @OneToMany(() => FamilyRelationship, relation => relation.sourceMember)
  outgoingRelations!: FamilyRelationship[]

  @OneToMany(() => FamilyRelationship, relation => relation.targetMember)
  incomingRelations!: FamilyRelationship[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @DeleteDateColumn()
  deletedAt!: Date
}
