import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1749276331313 implements MigrationInterface {
    name = 'InitialMigration1749276331313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "location" character varying(255), "preferences" text, "favorite_styles" json, "user_id" uuid NOT NULL, CONSTRAINT "REL_07a7a09b04e7b035c9d90cf498" UNIQUE ("user_id"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "masters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "location" character varying(255), "specialties" json, "rating" numeric(3,2) NOT NULL DEFAULT '0', "reviews_count" integer NOT NULL DEFAULT '0', "description" text, "work_schedule" json, "portfolio_images" json, "is_verified" boolean NOT NULL DEFAULT true, "base_price" numeric(10,2), "user_id" uuid NOT NULL, CONSTRAINT "REL_2db7257abffee4d4c3004b4da7" UNIQUE ("user_id"), CONSTRAINT "PK_ffb63641dda57195f6e23dc4c0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_type_enum" AS ENUM('client', 'master', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "type" "public"."users_type_enum" NOT NULL DEFAULT 'client', "is_active" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP, "avatar_url" character varying(255), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."designs_category_enum" AS ENUM('manicure', 'pedicure', 'nail_art', 'extension', 'repair')`);
        await queryRunner.query(`CREATE TYPE "public"."designs_difficulty_enum" AS ENUM('easy', 'medium', 'hard', 'expert')`);
        await queryRunner.query(`CREATE TABLE "designs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "title" character varying(255) NOT NULL, "description" text, "category" "public"."designs_category_enum" NOT NULL, "difficulty" "public"."designs_difficulty_enum" NOT NULL DEFAULT 'medium', "image_urls" json, "tags" json, "price" numeric(10,2), "duration_minutes" integer, "is_active" boolean NOT NULL DEFAULT true, "views_count" integer NOT NULL DEFAULT '0', "likes_count" integer NOT NULL DEFAULT '0', "master_id" uuid NOT NULL, CONSTRAINT "PK_3679aaa73bc37ec35a24a3cfde8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "scheduled_at" TIMESTAMP NOT NULL, "duration_minutes" integer NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "price" numeric(10,2), "notes" text, "cancellation_reason" text, "confirmed_at" TIMESTAMP, "completed_at" TIMESTAMP, "client_id" uuid NOT NULL, "master_id" uuid NOT NULL, "design_id" uuid, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "masters" ADD CONSTRAINT "FK_2db7257abffee4d4c3004b4da75" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "designs" ADD CONSTRAINT "FK_08be6f15f32d6d0088f952a5925" FOREIGN KEY ("master_id") REFERENCES "masters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_23096dca2f7a9d1505d0267d4c6" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_a0519bd387c76e48883119a4f35" FOREIGN KEY ("master_id") REFERENCES "masters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_0741df9060e9896c06beeb4c4b0" FOREIGN KEY ("design_id") REFERENCES "designs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_0741df9060e9896c06beeb4c4b0"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_a0519bd387c76e48883119a4f35"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_23096dca2f7a9d1505d0267d4c6"`);
        await queryRunner.query(`ALTER TABLE "designs" DROP CONSTRAINT "FK_08be6f15f32d6d0088f952a5925"`);
        await queryRunner.query(`ALTER TABLE "masters" DROP CONSTRAINT "FK_2db7257abffee4d4c3004b4da75"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "FK_07a7a09b04e7b035c9d90cf4984"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
        await queryRunner.query(`DROP TABLE "designs"`);
        await queryRunner.query(`DROP TYPE "public"."designs_difficulty_enum"`);
        await queryRunner.query(`DROP TYPE "public"."designs_category_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
        await queryRunner.query(`DROP TABLE "masters"`);
        await queryRunner.query(`DROP TABLE "clients"`);
    }

}
