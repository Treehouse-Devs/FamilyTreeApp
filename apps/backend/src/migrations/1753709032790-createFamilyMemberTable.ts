import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateFamilyMemberTable1753709032790 implements MigrationInterface {
  name = 'CreateFamilyMemberTable1753709032790'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."family_members_gender_enum" AS ENUM('male', 'female')`)
    await queryRunner.query(`CREATE TABLE "family_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyId" uuid NOT NULL, "fullName" character varying(100) NOT NULL, "gender" "public"."family_members_gender_enum" NOT NULL, "birthDate" date NOT NULL, "deathDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_186da7c7fcbf23775fdd888a747" PRIMARY KEY ("id"))`)
    await queryRunner.query(`ALTER TABLE "family_members" ADD CONSTRAINT "FK_8e1c2c602b66f79d1ac89f24d97" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "family_members" DROP CONSTRAINT "FK_8e1c2c602b66f79d1ac89f24d97"`)
    await queryRunner.query(`DROP TABLE "family_members"`)
    await queryRunner.query(`DROP TYPE "public"."family_members_gender_enum"`)
  }
}
