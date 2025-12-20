ALTER TYPE "public"."sale_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "product_type" SET DEFAULT 'physical';--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "jurisdiction_id" SET DEFAULT 'CO';--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "issue_date" SET DEFAULT 'now()';--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "subtotal" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "tax" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "total" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "product_type" SET DEFAULT 'physical';--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "subtotal" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "tax" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "total" SET DEFAULT '0';