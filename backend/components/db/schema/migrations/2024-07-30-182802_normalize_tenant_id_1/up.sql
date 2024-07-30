ALTER TABLE tenant_rolebinding ADD COLUMN tenant_id TEXT;
ALTER TABLE tenant_rolebinding ADD COLUMN partner_tenant_id TEXT;

ALTER TABLE tenant_rolebinding
ADD CONSTRAINT fk_tenant_rolebinding_tenant_id
    FOREIGN KEY(tenant_id)
    REFERENCES tenant(id)
    DEFERRABLE INITIALLY DEFERRED;

-- Low row count -- should be fast enough to run non-concurrently in a transaction.
CREATE INDEX IF NOT EXISTS tenant_rolebinding_tenant_id ON tenant_rolebinding(tenant_id);

ALTER TABLE tenant_rolebinding
ADD CONSTRAINT fk_tenant_rolebinding_partner_tenant_id
    FOREIGN KEY(partner_tenant_id)
    REFERENCES partner_tenant(id)
    DEFERRABLE INITIALLY DEFERRED;

-- Low row count -- should be fast enough to run non-concurrently in a transaction.
CREATE INDEX IF NOT EXISTS tenant_rolebinding_partner_tenant_id ON tenant_rolebinding(partner_tenant_id);
