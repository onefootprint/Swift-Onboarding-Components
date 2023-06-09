ALTER TABLE tenant_api_key
    ADD COLUMN role_id TEXT,
    ADD CONSTRAINT fk_tenant_api_key_role_id
        FOREIGN KEY(role_id)
        REFERENCES tenant_role(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX tenant_api_key_role_id ON tenant_api_key(role_id);

-- backfill role_id with the admin role - they currently have admin permissions
UPDATE tenant_api_key
SET role_id = tenant_role.id
FROM tenant_role
WHERE tenant_role.tenant_id = tenant_api_key.tenant_id AND tenant_role.is_immutable AND tenant_role.name = 'Admin' AND tenant_role.deactivated_at IS NULL;

-- Grrr triggers trigger me
COMMIT;
BEGIN;

ALTER TABLE tenant_api_key ALTER COLUMN role_id SET NOT NULL;