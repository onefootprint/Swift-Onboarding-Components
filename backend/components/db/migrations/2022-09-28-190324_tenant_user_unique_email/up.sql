ALTER TABLE tenant_user ADD COLUMN tenant_id TEXT;

UPDATE tenant_user
    SET tenant_id = tenant_role.tenant_id
    FROM tenant_role
    WHERE tenant_role.id = tenant_user.tenant_role_id;

ALTER TABLE tenant_user ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE tenant_user
    ADD CONSTRAINT fk_tenant_user_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id),
    ADD CONSTRAINT tenant_user_unique_tenant_email UNIQUE(email, tenant_id);

CREATE INDEX IF NOT EXISTS tenant_user_tenant_id ON tenant_user(tenant_id);