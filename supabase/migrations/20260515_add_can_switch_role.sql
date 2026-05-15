-- Add can_switch_role column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS can_switch_role boolean NOT NULL DEFAULT false;

-- Grant dual-access to pauloricsd@gmail.com
UPDATE profiles
SET can_switch_role = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'pauloricsd@gmail.com'
);
