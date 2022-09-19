-- This file should undo anything in `up.sql`
ALTER TABLE tenant ADD COLUMN workos_admin_profile_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS tenant_profile_id ON tenant(workos_admin_profile_id);