CREATE TABLE tenant_rolebinding (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('org_rb_'),
    tenant_user_id TEXT NOT NULL,
    tenant_role_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    last_login_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tenant_rolebinding_tenant_user_id
        FOREIGN KEY(tenant_user_id) 
        REFERENCES tenant_user(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_tenant_rolebinding_tenant_role_id
        FOREIGN KEY(tenant_role_id) 
        REFERENCES tenant_role(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_tenant_rolebinding_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS tenant_rolebinding_tenant_user_id ON tenant_rolebinding(tenant_user_id);
CREATE INDEX IF NOT EXISTS tenant_rolebinding_tenant_role_id ON tenant_rolebinding(tenant_role_id);
CREATE INDEX IF NOT EXISTS tenant_rolebinding_tenant_id ON tenant_rolebinding(tenant_id);
-- Only allow one active rolebinding per (user, tenant) combo.
CREATE UNIQUE INDEX IF NOT EXISTS tenant_rolebinding_unique_tenant_user_id_tenant_id ON tenant_rolebinding(tenant_user_id, tenant_id) WHERE deactivated_at IS NULL;

SELECT diesel_manage_updated_at('tenant_rolebinding');