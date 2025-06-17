import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";
import { env } from "./env";

config({ path: '.env' });

export default defineConfig({
  schema: "./api/lib/db/schema.ts",
  out: "./api/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
