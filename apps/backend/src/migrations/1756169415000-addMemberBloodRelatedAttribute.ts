import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMemberBloodRelatedAttribute1756169415000 implements MigrationInterface {
  name = 'AddMemberBloodRelatedAttribute1756169415000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "family_members" ADD "isBloodRelated" boolean NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "isBloodRelated"`)
  }
}
