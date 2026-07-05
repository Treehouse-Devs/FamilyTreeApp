import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLanguageAndProfileNotNull1775347200000 implements MigrationInterface {
  name = 'AddLanguageAndProfileNotNull1775347200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add language column with default 'en'
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "language" character varying NOT NULL DEFAULT 'en'
    `)

    // 2. Backfill gender NULLs before making it NOT NULL
    await queryRunner.query(`
      UPDATE "users" SET "gender" = 'male' WHERE "gender" IS NULL
    `)
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "gender" SET NOT NULL
    `)

    // 3. Convert birthDate from nullable date → not-null bigint (epoch ms)
    //    Existing NULL rows become 0; existing date rows are converted to epoch ms
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "birthDate" TYPE bigint
      USING CASE
        WHEN "birthDate" IS NULL THEN 0
        ELSE EXTRACT(EPOCH FROM "birthDate") * 1000
      END
    `)
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "birthDate" SET NOT NULL
    `)
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "birthDate" SET DEFAULT 0
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse birthDate back to nullable date
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "birthDate" DROP DEFAULT
    `)
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "birthDate" DROP NOT NULL
    `)
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "birthDate" TYPE date
      USING CASE
        WHEN "birthDate" = 0 THEN NULL
        ELSE to_timestamp("birthDate" / 1000.0)::date
      END
    `)

    // Reverse gender back to nullable
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "gender" DROP NOT NULL
    `)

    // Drop language column
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "language"
    `)
  }
}
