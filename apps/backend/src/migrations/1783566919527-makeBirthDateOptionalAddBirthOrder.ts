import type { MigrationInterface, QueryRunner } from 'typeorm'

export class MakeBirthDateOptionalAddBirthOrder1783566919527 implements MigrationInterface {
  name = 'MakeBirthDateOptionalAddBirthOrder1783566919527'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "family_members"
        ALTER COLUMN "birthDate" DROP NOT NULL,
        ALTER COLUMN "birthDate" DROP DEFAULT,
        ADD COLUMN "birthOrder" int NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Backfill any NULL birthDate to 0 so the NOT NULL constraint can be restored.
    await queryRunner.query(`
      UPDATE "family_members" SET "birthDate" = 0 WHERE "birthDate" IS NULL
    `)

    await queryRunner.query(`
      ALTER TABLE "family_members"
        DROP COLUMN "birthOrder",
        ALTER COLUMN "birthDate" SET DEFAULT 0,
        ALTER COLUMN "birthDate" SET NOT NULL
    `)
  }
}
