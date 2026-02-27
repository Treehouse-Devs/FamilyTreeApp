import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDetailFieldsToFamilyMember1772168513514 implements MigrationInterface {
    name = 'AddDetailFieldsToFamilyMember1772168513514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_members" ADD "isBloodRelated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "imageThumbnailUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "fullImageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "nationality" character varying`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "hometown" character varying`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "domicile" character varying`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "phoneNumber" bigint`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "homeNumber" bigint`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "occupation" character varying`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "officeAddress" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "officeAddress"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "occupation"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "homeNumber"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "domicile"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "hometown"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "nationality"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "fullImageUrl"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "imageThumbnailUrl"`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "isBloodRelated"`);
    }

}
