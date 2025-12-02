-- Fix user roles for contatojoaochristofoli@gmail.com
-- User ID: 5e6cbf11-641d-4e89-92a6-1b95da827e8a

-- Step 1: Verify current roles
SELECT 'Current user_roles:' as info;
SELECT * FROM user_roles 
WHERE user_id = '5e6cbf11-641d-4e89-92a6-1b95da827e8a';

-- Step 2: Verify creator status
SELECT 'Current creator record:' as info;
SELECT id, name, slug, user_id FROM creators 
WHERE user_id = '5e6cbf11-641d-4e89-92a6-1b95da827e8a';

-- Step 3: Add admin role if missing
INSERT INTO user_roles (user_id, role)
VALUES ('5e6cbf11-641d-4e89-92a6-1b95da827e8a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 4: Verify roles after fix
SELECT 'Roles after fix:' as info;
SELECT * FROM user_roles 
WHERE user_id = '5e6cbf11-641d-4e89-92a6-1b95da827e8a';

-- Step 5: Show all roles for this user
SELECT 'Summary - All roles and creator status:' as info;
SELECT 
  u.id as user_id,
  u.email,
  (SELECT array_agg(role) FROM user_roles WHERE user_id = u.id) as roles,
  EXISTS(SELECT 1 FROM creators WHERE user_id = u.id) as is_creator,
  (SELECT name FROM creators WHERE user_id = u.id LIMIT 1) as creator_name
FROM auth.users u
WHERE u.id = '5e6cbf11-641d-4e89-92a6-1b95da827e8a';
