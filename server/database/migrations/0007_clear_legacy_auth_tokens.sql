UPDATE "users" SET "setup_token" = NULL, "setup_token_expires_at" = NULL WHERE "setup_token" IS NOT NULL;--> statement-breakpoint
UPDATE "users" SET "password_reset_token" = NULL, "password_reset_token_expires_at" = NULL WHERE "password_reset_token" IS NOT NULL;
