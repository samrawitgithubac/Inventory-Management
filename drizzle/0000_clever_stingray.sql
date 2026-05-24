CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"image_public_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
