CREATE TYPE "public"."shift_type" AS ENUM('bar', 'cleaning', 'bar-support');--> statement-breakpoint
ALTER TABLE "shift_templates" ADD COLUMN "type" "shift_type" DEFAULT 'bar' NOT NULL;--> statement-breakpoint
ALTER TABLE "planned_shifts" ADD COLUMN "type" "shift_type" DEFAULT 'bar' NOT NULL;--> statement-breakpoint
ALTER TABLE "shift_user_preferences" RENAME COLUMN "max_shifts_per_month" TO "max_bar_shifts_per_month";--> statement-breakpoint
ALTER TABLE "shift_user_preferences" ADD COLUMN "max_bar_support_shifts_per_month" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "shift_user_preferences" ADD COLUMN "max_cleaning_shifts_per_month" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "shift_user_preferences" ALTER COLUMN "max_bar_support_shifts_per_month" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "shift_user_preferences" ALTER COLUMN "max_cleaning_shifts_per_month" DROP DEFAULT;
