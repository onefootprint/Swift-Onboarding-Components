SELECT 1;

-- To reverse this migration, run the following queries in two separate transactions:


-- Transaction 1:
-- WITH s AS (
-- 	SELECT tenant_rolebinding.id AS id, tenant_role.tenant_id AS tenant_id FROM tenant_rolebinding
-- 	INNER JOIN tenant_role
-- 	ON tenant_rolebinding.tenant_role_id = tenant_role.id
-- )
-- UPDATE tenant_rolebinding
-- SET tenant_id = s.tenant_id
-- FROM s
-- WHERE tenant_rolebinding.id = s.id;
-- ALTER TABLE tenant_rolebinding ALTER COLUMN tenant_id SET NOT NULL;


-- Transaction 2:
-- ALTER TABLE tenant_rolebinding ALTER COLUMN tenant_id SET NOT NULL;
