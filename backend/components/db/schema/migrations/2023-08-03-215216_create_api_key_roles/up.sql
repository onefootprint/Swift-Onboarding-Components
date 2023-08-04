DROP INDEX IF EXISTS tenant_role_unique_name_for_tenant_id;

CREATE UNIQUE INDEX IF NOT EXISTS tenant_role_unique_name_for_tenant_id_kind_is_live ON tenant_role(tenant_id, kind, is_live, lower(name)) WHERE deactivated_at IS NULL;

INSERT INTO tenant_role(tenant_id, name, scopes, is_immutable, kind, is_live, created_at)
SELECT 
    tenant.id,
    'Admin',
    array[json_build_object('kind', 'admin')]::jsonb[],
    true,
    'api_key',
    true,
    current_timestamp
FROM tenant;

INSERT INTO tenant_role(tenant_id, name, scopes, is_immutable, kind, is_live, created_at)
SELECT 
    tenant.id,
    'Admin',
    array[json_build_object('kind', 'admin')]::jsonb[],
    true,
    'api_key',
    false,
    current_timestamp
FROM tenant;

INSERT INTO tenant_role(tenant_id, name, scopes, is_immutable, kind, is_live, created_at)
SELECT 
    tenant.id,
    'Member',
    array[json_build_object('kind', 'read')]::jsonb[],
    true,
    'api_key',
    true,
    current_timestamp
FROM tenant;

INSERT INTO tenant_role(tenant_id, name, scopes, is_immutable, kind, is_live, created_at)
SELECT 
    tenant.id,
    'Member',
    array[json_build_object('kind', 'read')]::jsonb[],
    true,
    'api_key',
    false,
    current_timestamp
FROM tenant;

-- Also create the dashboard_user roles

INSERT INTO tenant_role(tenant_id, name, scopes, is_immutable, kind, created_at)
SELECT 
    tenant.id,
    'Admin',
    array[json_build_object('kind', 'admin')]::jsonb[],
    true,
    'dashboard_user',
    current_timestamp
FROM tenant;

INSERT INTO tenant_role(tenant_id, name, scopes, is_immutable, kind, created_at)
SELECT 
    tenant.id,
    'Member',
    array[json_build_object('kind', 'read')]::jsonb[],
    true,
    'dashboard_user',
    current_timestamp
FROM tenant;