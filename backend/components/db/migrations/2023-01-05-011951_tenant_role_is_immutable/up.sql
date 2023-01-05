ALTER TABLE tenant_role ADD COLUMN is_immutable BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tenant_role ALTER COLUMN is_immutable DROP DEFAULT;

-- Backfill all admin roles to be immutable
UPDATE tenant_role
    SET is_immutable = 't'
    WHERE scopes->0->>'kind' = 'admin';