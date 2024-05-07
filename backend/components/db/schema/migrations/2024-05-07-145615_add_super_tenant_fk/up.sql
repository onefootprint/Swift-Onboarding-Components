ALTER TABLE tenant ADD COLUMN super_tenant_id TEXT;
ALTER TABLE tenant ADD CONSTRAINT fk_tenant_super_tenant_id
    FOREIGN KEY(super_tenant_id)
    REFERENCES tenant(id)
    DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS tenant_super_tenant_id ON tenant(super_tenant_id);
    