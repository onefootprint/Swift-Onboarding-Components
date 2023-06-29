ALTER TABLE tenant_user
    ADD COLUMN tenant_role_id TEXT,
    ADD COLUMN tenant_id TEXT,
    ADD COLUMN last_login_at TIMESTAMPTZ,
    ADD COLUMN deactivated_at TIMESTAMPTZ;

-- Backfill the restored tenant_user columns with info from the tenant_rolebinding table
-- Note, this will not re-create a secondary tenant_user if the user has multiple rolebindings.
-- That's fine since this won't really be run in prod, and there aren't any non-employee users
-- with multiple rolebindings in prod anyways.
UPDATE tenant_user tu
SET
    tenant_role_id = trb.tenant_role_id,
    tenant_id = trb.tenant_id,
    last_login_at = trb.last_login_at,
    deactivated_at = trb.deactivated_at
FROM tenant_rolebinding trb
WHERE trb.tenant_user_id = tu.id;

TRUNCATE tenant_rolebinding;

ALTER TABLE tenant_user
    ALTER COLUMN tenant_role_id SET NOT NULL,
    ALTER COLUMN tenant_id SET NOT NULL,
    ADD CONSTRAINT fk_tenant_user_tenant_role_id
        FOREIGN KEY(tenant_role_id) 
        REFERENCES tenant_role(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_tenant_user_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS tenant_user_tenant_role_id ON tenant_user(tenant_role_id);
CREATE INDEX IF NOT EXISTS tenant_user_tenant_id ON tenant_user(tenant_id);