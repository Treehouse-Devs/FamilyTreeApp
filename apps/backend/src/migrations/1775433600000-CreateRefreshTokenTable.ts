import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateRefreshTokenTable1775433600000 implements MigrationInterface {
  name = 'CreateRefreshTokenTable1775433600000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(128) NOT NULL, "tokenHash" character varying(64) NOT NULL, "expiredAt" bigint NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"))`)
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_refresh_tokens_tokenHash" ON "refresh_tokens" ("tokenHash")`)
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_userId"`)
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_tokenHash"`)
    await queryRunner.query(`DROP TABLE "refresh_tokens"`)
  }
}
