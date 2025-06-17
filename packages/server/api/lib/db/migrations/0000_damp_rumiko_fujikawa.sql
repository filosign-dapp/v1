CREATE TABLE "files_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"cid" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
