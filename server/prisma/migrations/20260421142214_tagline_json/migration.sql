-- AlterTable: convert tagline from text to jsonb, preserving existing values as { en, es }
ALTER TABLE "Brand"
  ALTER COLUMN "tagline" TYPE JSONB
  USING jsonb_build_object('en', "tagline", 'es', "tagline");
