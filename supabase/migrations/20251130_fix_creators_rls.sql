-- Enable RLS
ALTER TABLE "public"."creators" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own creator profile" 
ON "public"."creators" 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own creator profile" 
ON "public"."creators" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own creator profile" 
ON "public"."creators" 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Admins can do everything
-- Assuming there is an is_admin() function or checking user_roles table
-- For simplicity, we can check if the user has the 'admin' role in user_roles
CREATE POLICY "Admins can do everything on creators" 
ON "public"."creators" 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM "public"."user_roles" 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
