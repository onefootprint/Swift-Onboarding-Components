ALTER TABLE tenant_role ALTER COLUMN tenant_id DROP NOT NULL;

ALTER TABLE tenant_role ADD COLUMN partner_tenant_id text REFERENCES partner_tenant(id);
CREATE INDEX IF NOT EXISTS tenant_role_partner_tenant_id ON tenant_role(partner_tenant_id);

ALTER TABLE tenant_role ADD CONSTRAINT tenant_id_xor_partner_tenant_id
CHECK ((tenant_id IS NULL) != (partner_tenant_id IS NULL));
