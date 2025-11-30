-- Add user_id to creators table
ALTER TABLE "public"."creators" 
ADD COLUMN "user_id" UUID REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Add unique constraint to ensure one creator profile per user
ALTER TABLE "public"."creators" 
ADD CONSTRAINT "creators_user_id_key" UNIQUE ("user_id");

-- Create index for performance
CREATE INDEX "creators_user_id_idx" ON "public"."creators" ("user_id");
