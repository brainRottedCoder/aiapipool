ALTER TABLE "provider_keys" ALTER COLUMN "remaining_credits" SET DEFAULT '50.0000';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" varchar(255);