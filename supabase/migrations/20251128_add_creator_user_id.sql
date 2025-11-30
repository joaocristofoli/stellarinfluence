-- Add user_id column to creators table to link users to their creator profiles
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);

-- Update RLS policies to allow creators to edit their own profiles
CREATE POLICY "Creators can update own profile"
ON creators
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Creators can view own profile"
ON creators
FOR SELECT
USING (auth.uid() = user_id);

-- Note: Admins already have full access via existing RLS policies
