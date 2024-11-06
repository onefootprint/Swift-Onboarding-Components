-- Insert creation events
WITH creation_events AS (
    SELECT
        tenant_id,
        id as tenant_role_id,
        created_at as timestamp,
        scopes
    FROM tenant_role tr
    WHERE NOT EXISTS (
        SELECT 1 FROM audit_event ae
        WHERE ae.tenant_role_id = tr.id
        AND ae.name = 'create_org_role'
    )
    AND tenant_id IS NOT NULL
)
INSERT INTO audit_event (
    tenant_id,
    timestamp,
    name,
    metadata,
    principal_actor,
    tenant_role_id
)
SELECT
    tenant_id,
    timestamp,
    'create_org_role',
    jsonb_build_object(
        'data', jsonb_build_object(
            'scopes', scopes
        ),
        'kind', 'create_org_role'
    ),
    NULL,
    tenant_role_id
FROM creation_events;



-- Insert deactivation events
WITH deactivation_events AS (
    SELECT
        tenant_id,
        deactivated_at,
        id as tenant_role_id,
        scopes
    FROM tenant_role tr
    WHERE deactivated_at IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM audit_event ae
        WHERE ae.tenant_role_id = tr.id
        AND ae.name = 'deactivate_org_role'
    )
    AND tenant_id IS NOT NULL
)
INSERT INTO audit_event (
    tenant_id,
    timestamp,
    name,
    metadata,
    principal_actor,
    tenant_role_id
)
SELECT
    tenant_id,
    deactivated_at,
    'deactivate_org_role',
    jsonb_build_object(
        'kind', 'deactivate_org_role'
    ),
    NULL,
    tenant_role_id
FROM deactivation_events;