ALTER TABLE tenants DROP COLUMN email_domain;
ALTER TABLE tenants ADD COLUMN workos_admin_profile_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS tenants_profile_id ON tenants(workos_admin_profile_id);
ALTER TABLE tenants ALTER COLUMN workos_id DROP NOT NULL;
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_name_key;