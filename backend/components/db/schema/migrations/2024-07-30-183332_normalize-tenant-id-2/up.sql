-- Run this manually in prod & mark as done in __diesel_schema_migrations.
UPDATE tenant_rolebinding
SET
	tenant_id = (SELECT tenant_id FROM tenant_role WHERE id = tenant_rolebinding.tenant_role_id),
 	partner_tenant_id = (SELECT partner_tenant_id FROM tenant_role WHERE id = tenant_rolebinding.tenant_role_id);
