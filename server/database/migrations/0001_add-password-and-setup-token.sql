ALTER TABLE "users" RENAME COLUMN "name" TO "first_name";
ALTER TABLE "users" ADD COLUMN "last_name" varchar(255);
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255);
ALTER TABLE "users" ADD COLUMN "setup_token" varchar(255);
ALTER TABLE "users" ADD COLUMN "setup_token_expires_at" timestamp with time zone;
ALTER TABLE "users" ADD CONSTRAINT "users_setup_token_unique" UNIQUE("setup_token");
