ALTER TABLE "shift_templates" RENAME COLUMN "label" TO "comment";--> statement-breakpoint
ALTER TABLE "shift_templates" ALTER COLUMN "comment" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "shift_templates" ALTER COLUMN "comment" DROP NOT NULL;--> statement-breakpoint
UPDATE "shift_templates" SET "comment" = NULL WHERE "comment" = '';--> statement-breakpoint
ALTER TABLE "planned_shifts" RENAME COLUMN "label" TO "comment";--> statement-breakpoint
ALTER TABLE "planned_shifts" ALTER COLUMN "comment" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "planned_shifts" ALTER COLUMN "comment" DROP NOT NULL;--> statement-breakpoint
UPDATE "planned_shifts" SET "comment" = NULL WHERE "comment" = '';
