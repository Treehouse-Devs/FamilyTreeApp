import type { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateFamilyMemberTable1777794728775 implements MigrationInterface {
  name = 'UpdateFamilyMemberTable1777794728775'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "family_members"
        ADD COLUMN "fatherId"  uuid NULL,
        ADD COLUMN "motherId"  uuid NULL,
        ADD COLUMN "spouseId"  uuid NULL,
        DROP COLUMN "birthDate",
        DROP COLUMN "deathDate",
        ADD COLUMN "birthDate" bigint NOT NULL DEFAULT 0,
        ADD COLUMN "deathDate" bigint NULL
    `)

    await queryRunner.query(`
      ALTER TABLE "family_members"
        ADD CONSTRAINT "FK_family_members_fatherId"
          FOREIGN KEY ("fatherId") REFERENCES "family_members" ("id") ON DELETE SET NULL,
        ADD CONSTRAINT "FK_family_members_motherId"
          FOREIGN KEY ("motherId") REFERENCES "family_members" ("id") ON DELETE SET NULL,
        ADD CONSTRAINT "FK_family_members_spouseId"
          FOREIGN KEY ("spouseId") REFERENCES "family_members" ("id") ON DELETE SET NULL
    `)

    await queryRunner.query(`DROP TABLE "family_relationships"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "family_relationships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "familyId" uuid NOT NULL,
        "sourceMemberId" uuid NOT NULL,
        "targetMemberId" uuid NOT NULL,
        "relationType" character varying NOT NULL,
        CONSTRAINT "PK_family_relationships_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_family_relationships_familyId" FOREIGN KEY ("familyId") REFERENCES "family" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_family_relationships_sourceMemberId" FOREIGN KEY ("sourceMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_family_relationships_targetMemberId" FOREIGN KEY ("targetMemberId") REFERENCES "family_members" ("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "family_members"
        DROP CONSTRAINT "FK_family_members_fatherId",
        DROP CONSTRAINT "FK_family_members_motherId",
        DROP CONSTRAINT "FK_family_members_spouseId"
    `)

    await queryRunner.query(`
      ALTER TABLE "family_members"
        DROP COLUMN "fatherId",
        DROP COLUMN "motherId",
        DROP COLUMN "spouseId",
        ALTER COLUMN "birthDate" TYPE date USING to_timestamp("birthDate"::double precision / 1000)::date,
        ALTER COLUMN "deathDate" TYPE date USING to_timestamp("deathDate"::double precision / 1000)::date
    `)
  }
}
