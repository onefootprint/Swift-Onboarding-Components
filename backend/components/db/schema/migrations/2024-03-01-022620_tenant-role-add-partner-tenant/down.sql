ALTER TABLE tenant_role DROP CONSTRAINT tenant_id_xor_partner_tenant_id;

ALTER TABLE tenant_role DROP COLUMN partner_tenant_id;

ALTER TABLE tenant_role ALTER COLUMN tenant_id SET NOT NULL;
