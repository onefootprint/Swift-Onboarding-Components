-- Run this manually in prod & mark as done in __diesel_schema_migrations.
ALTER TABLE tenant_rolebinding
ADD CONSTRAINT tenant_id_xor_partner_tenant_id
CHECK ((tenant_id IS NULL) != (partner_tenant_id IS NULL));

CREATE UNIQUE INDEX IF NOT EXISTS
tenant_rolebinding_unique_tenant_user_id_tenant_id
ON tenant_rolebinding(tenant_user_id, tenant_id)
WHERE deactivated_at IS NULL AND tenant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS
tenant_rolebinding_unique_tenant_user_id_partner_tenant_id
ON tenant_rolebinding(tenant_user_id, partner_tenant_id)
WHERE deactivated_at IS NULL AND partner_tenant_id IS NOT NULL;
