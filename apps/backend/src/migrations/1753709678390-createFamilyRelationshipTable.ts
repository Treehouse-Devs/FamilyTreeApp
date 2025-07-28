import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFamilyRelationshipTable1753709678390 implements MigrationInterface {
    name = 'CreateFamilyRelationshipTable1753709678390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."family_relationships_relationtype_enum" AS ENUM('PARENT', 'SPOUSE')`);
        await queryRunner.query(`CREATE TABLE "family_relationships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "familyId" uuid NOT NULL, "sourceMemberId" uuid NOT NULL, "targetMemberId" uuid NOT NULL, "relationType" "public"."family_relationships_relationtype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_fe48a493e1a946437fbae4e1a34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "family_relationships" ADD CONSTRAINT "FK_3a52c9eeabada7428882720fe64" FOREIGN KEY ("familyId") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family_relationships" ADD CONSTRAINT "FK_6d748473cd1ab9c6bc73add6f22" FOREIGN KEY ("sourceMemberId") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "family_relationships" ADD CONSTRAINT "FK_9a37e2614dfc943f8524b565c2a" FOREIGN KEY ("targetMemberId") REFERENCES "family_members"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_relationships" DROP CONSTRAINT "FK_9a37e2614dfc943f8524b565c2a"`);
        await queryRunner.query(`ALTER TABLE "family_relationships" DROP CONSTRAINT "FK_6d748473cd1ab9c6bc73add6f22"`);
        await queryRunner.query(`ALTER TABLE "family_relationships" DROP CONSTRAINT "FK_3a52c9eeabada7428882720fe64"`);
        await queryRunner.query(`DROP TABLE "family_relationships"`);
        await queryRunner.query(`DROP TYPE "public"."family_relationships_relationtype_enum"`);
    }

}
