import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set: add it to your env file (.env, or .env.local if there is no .env)",
  );
}

export const sql = neon(process.env.DATABASE_URL!);
