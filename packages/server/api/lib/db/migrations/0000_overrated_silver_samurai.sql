CREATE TABLE "files_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"cid" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_directory" boolean DEFAULT false,
	"file_names" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp NOT NULL
);
