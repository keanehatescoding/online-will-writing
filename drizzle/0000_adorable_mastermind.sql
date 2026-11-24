CREATE TYPE "public"."asset_kind" AS ENUM('land', 'bank_account', 'vehicle', 'shares', 'sacco', 'pension', 'personal_effects', 'business', 'digital', 'other');--> statement-breakpoint
CREATE TYPE "public"."bequest_kind" AS ENUM('specific', 'residuary', 'pecuniary');--> statement-breakpoint
CREATE TYPE "public"."will_status" AS ENUM('draft', 'ready_to_sign', 'signed', 'revoked');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid NOT NULL,
	"kind" "asset_kind" NOT NULL,
	"description" text NOT NULL,
	"reference" text,
	"value_kes" integer
);
--> statement-breakpoint
CREATE TABLE "beneficiaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"relationship" text NOT NULL,
	"national_id" text,
	"date_of_birth" date,
	"contact" text,
	"is_minor" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid NOT NULL,
	"kind" "bequest_kind" NOT NULL,
	"asset_id" uuid,
	"beneficiary_id" uuid NOT NULL,
	"share_percentage_bps" integer,
	"pecuniary_amount_kes" integer,
	"conditions" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"national_id" text,
	"relationship" text,
	"contact" text,
	"is_alternate" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"date_of_birth" date,
	"national_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "will_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"body_md" text NOT NULL,
	"pdf_sha256" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"testator_id" uuid NOT NULL,
	"status" "will_status" DEFAULT 'draft' NOT NULL,
	"preamble" text DEFAULT '' NOT NULL,
	"revocation_clause" text DEFAULT '' NOT NULL,
	"guardianship_clause" text DEFAULT '' NOT NULL,
	"funeral_wishes" text DEFAULT '' NOT NULL,
	"signed_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "witnesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"will_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"national_id" text,
	"occupation" text,
	"signed_on" date
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bequests" ADD CONSTRAINT "bequests_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bequests" ADD CONSTRAINT "bequests_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bequests" ADD CONSTRAINT "bequests_beneficiary_id_beneficiaries_id_fk" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."beneficiaries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executors" ADD CONSTRAINT "executors_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "will_versions" ADD CONSTRAINT "will_versions_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wills" ADD CONSTRAINT "wills_testator_id_users_id_fk" FOREIGN KEY ("testator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "witnesses" ADD CONSTRAINT "witnesses_will_id_wills_id_fk" FOREIGN KEY ("will_id") REFERENCES "public"."wills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_will_idx" ON "assets" USING btree ("will_id");--> statement-breakpoint
CREATE INDEX "beneficiaries_will_idx" ON "beneficiaries" USING btree ("will_id");--> statement-breakpoint
CREATE INDEX "bequests_will_idx" ON "bequests" USING btree ("will_id");--> statement-breakpoint
CREATE INDEX "executors_will_idx" ON "executors" USING btree ("will_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_idx" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "will_versions_will_version_idx" ON "will_versions" USING btree ("will_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "wills_testator_idx" ON "wills" USING btree ("testator_id");--> statement-breakpoint
CREATE INDEX "witnesses_will_idx" ON "witnesses" USING btree ("will_id");