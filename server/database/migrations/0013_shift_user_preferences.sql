CREATE TABLE "shift_user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"max_shifts_per_month" integer NOT NULL,
	"shifts_on_consecutive_days" boolean NOT NULL,
	"shifts_in_consecutive_weeks" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shift_user_preferences_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "shift_user_preferences" ADD CONSTRAINT "shift_user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
