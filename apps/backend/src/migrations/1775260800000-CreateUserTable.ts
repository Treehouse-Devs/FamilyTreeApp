import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserTable1775260800000 implements MigrationInterface {
  name = 'CreateUserTable1775260800000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`)
    await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firebaseUid" character varying(128) NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "avatarUrl" character varying, "birthDate" date, "gender" "public"."users_gender_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_firebaseUid" ON "users" ("firebaseUid")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_firebaseUid"`)
    await queryRunner.query(`DROP TABLE "users"`)
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`)
  }
}
