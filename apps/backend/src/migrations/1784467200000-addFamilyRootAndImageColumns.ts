import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFamilyRootAndImageColumns1784467200000 implements MigrationInterface {
  name = 'AddFamilyRootAndImageColumns1784467200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "families"
        ADD "rootId" uuid,
        ADD "familyImageUrl" character varying
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "families"
        DROP COLUMN "familyImageUrl",
        DROP COLUMN "rootId"
    `)
  }
}
