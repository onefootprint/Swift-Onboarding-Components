SET CONSTRAINTS ALL IMMEDIATE;

DELETE FROM tenant_role WHERE name = 'Admin' AND is_immutable = 't' AND kind IS NOT NULL;
DELETE FROM tenant_role WHERE name = 'Member' AND is_immutable = 't' AND kind IS NOT NULL;

CREATE UNIQUE INDEX tenant_role_unique_name_for_tenant_id ON tenant_role(tenant_id, lower(name)) WHERE deactivated_at IS NULL;