import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePhoneNumbersToVarchar1772169487204 implements MigrationInterface {
    name = 'ChangePhoneNumbersToVarchar1772169487204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "homeNumber"`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "homeNumber" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "homeNumber"`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "homeNumber" bigint`);
        await queryRunner.query(`ALTER TABLE "family_members" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "family_members" ADD "phoneNumber" bigint`);
    }

}
