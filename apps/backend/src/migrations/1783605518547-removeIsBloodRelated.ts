import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveIsBloodRelated1783605518547 implements MigrationInterface {
  name = 'RemoveIsBloodRelated1783605518547'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "isBloodRelated"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "family_members" ADD "isBloodRelated" boolean NOT NULL DEFAULT false`)
  }
}
