CREATE TYPE "public"."calendar_entry_type" AS ENUM('publicEvent', 'internalEvent', 'reservation');--> statement-breakpoint
CREATE TABLE "calendar_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(2000) DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_date" date NOT NULL,
	"end_time" time NOT NULL,
	"type" "calendar_entry_type" NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_entries" ADD CONSTRAINT "calendar_entries_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;