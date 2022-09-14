CREATE TABLE tenant_user (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('orguser_'),
    tenant_role_id TEXT NOT NULL,
    email TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at timestamptz NOT NULL,
    last_login_at timestamptz NOT NULL,
    CONSTRAINT fk_tenant_user_tenant_role_id
        FOREIGN KEY(tenant_role_id) 
        REFERENCES tenant_role(id)
);

CREATE INDEX IF NOT EXISTS tenant_user_tenant_role_id ON tenant_user(tenant_role_id);

SELECT diesel_manage_updated_at('tenant_user');