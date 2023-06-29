-- Backfill read-only roles for all existing tenants - they may not trigger the get_or_create path in application code

WITH tenants_with_no_ro_role AS (
    SELECT tenant.id
    FROM tenant
    LEFT JOIN tenant_role
        ON tenant_role.tenant_id = tenant.id AND tenant_role.name = 'Read-only'
    WHERE
        tenant_role.id IS NULL
)
INSERT INTO tenant_role(tenant_id, name, scopes, is_immutable, created_at)
    SELECT 
        id,
        'Read-only',
        '[{"kind": "read"}]',
        't',
        CURRENT_TIMESTAMP
    FROM tenants_with_no_ro_role;