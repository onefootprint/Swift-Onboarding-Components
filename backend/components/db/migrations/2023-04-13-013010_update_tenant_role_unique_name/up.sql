DROP INDEX tenant_role_unique_name_for_tenant_id;
CREATE UNIQUE INDEX tenant_role_unique_name_for_tenant_id ON tenant_role(tenant_id, lower(name)) WHERE deactivated_at IS NULL;