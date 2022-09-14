CREATE TABLE tenant_role (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('orgrole_'),
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    permissions TEXT[] NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at timestamptz NOT NULL,
    CONSTRAINT fk_tenant_role_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
);

CREATE INDEX IF NOT EXISTS tenant_role_tenant_id ON tenant_role(tenant_id);
CREATE UNIQUE INDEX tenant_role_unique_name_for_tenant_id ON tenant_role(tenant_id, LOWER(name));

SELECT diesel_manage_updated_at('tenant_role');

INSERT INTO tenant_role(tenant_id, name, permissions, created_at)
    SELECT id, 'Admin', CAST(ARRAY['admin'] as TEXT[]), _created_at FROM tenant;