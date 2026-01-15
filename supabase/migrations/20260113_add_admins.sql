-- Add admin users: Gabriela and Lucas Silva
-- This migration grants admin privileges to specific users

-- Update Gabriela to admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
)
WHERE email = 'gabriela15332004@gmail.com';

-- Update Lucas Silva to admin  
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
)
WHERE email = 'lucassilva@agenciaeternizar.com.br'
   OR email LIKE 'lucassilva%'
   OR raw_user_meta_data->>'full_name' ILIKE '%lucas%silva%';

-- Verify admin users
DO $$
DECLARE
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM auth.users
    WHERE raw_user_meta_data->>'role' = 'admin';
    
    RAISE NOTICE 'Total admin users: %', admin_count;
END $$;
