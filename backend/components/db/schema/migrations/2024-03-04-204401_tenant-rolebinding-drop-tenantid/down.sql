SELECT 1;

-- The down migration would take three transactions:

-- Transaction 1: Add back column.
-- ALTER TABLE tenant_rolebinding ADD COLUMN tenant_id TEXT;

-- Transaction 2: Backfill from join to denormalize tenant_id.
-- WITH s AS (
-- 	SELECT tenant_rolebinding.id AS id, tenant_role.tenant_id AS tenant_id FROM tenant_rolebinding
-- 	INNER JOIN tenant_role
-- 	ON tenant_rolebinding.tenant_role_id = tenant_role.id
-- )
-- UPDATE tenant_rolebinding
-- SET tenant_id = s.tenant_id
-- FROM s
-- WHERE tenant_rolebinding.id = s.id;

-- Transaction 3: Add back indexes and constraints.
-- ALTER TABLE tenant_rolebinding
-- ADD CONSTRAINT fk_tenant_rolebinding_tenant_id
--     FOREIGN KEY(tenant_id)
--     REFERENCES tenant(id)
--     DEFERRABLE INITIALLY DEFERRED;
-- CREATE INDEX IF NOT EXISTS tenant_rolebinding_tenant_id ON tenant_rolebinding(tenant_id);
