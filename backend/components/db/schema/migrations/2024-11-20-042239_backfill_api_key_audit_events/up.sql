-- Insert creation events
WITH creation_events AS (
    SELECT
        tenant_id,
        id as tenant_api_key_id,
        created_at as timestamp,
        role_id as tenant_role_id,
        is_live
    FROM tenant_api_key tap
    WHERE NOT EXISTS (
        SELECT 1 FROM audit_event ae
        WHERE ae.tenant_api_key_id = tap.id
        AND ae.name = 'create_org_api_key'
    )
    AND tenant_id IS NOT NULL
)
INSERT INTO audit_event (
    tenant_id,
    timestamp,
    name,
    metadata,
    principal_actor,
    tenant_api_key_id,
    tenant_role_id,
    is_live
)
SELECT
    tenant_id,
    timestamp,
    'create_org_api_key',
    jsonb_build_object(
        'kind', 'create_org_api_key'
    ),
    NULL,
    tenant_api_key_id,
    tenant_role_id,
    is_live
FROM creation_events;

-- Update existing records to set is_live where it's currently null
UPDATE audit_event ae
SET is_live = tap.is_live
FROM tenant_api_key tap
WHERE ae.tenant_api_key_id = tap.id
AND ae.is_live IS NULL;

-- Insert deactivation events
WITH deactivation_events AS (
    SELECT
        tenant_id,
        deactivated_at,
        id as tenant_api_key_id,
        role_id as tenant_role_id,
        is_live
    FROM tenant_api_key tap
    WHERE deactivated_at IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM audit_event ae
        WHERE ae.tenant_api_key_id = tap.id
        AND ae.name = 'update_org_api_key_status'
    )
    AND tenant_id IS NOT NULL
)
INSERT INTO audit_event (
    tenant_id,
    timestamp,
    name,
    metadata,
    principal_actor,
    tenant_api_key_id,
    tenant_role_id,
    is_live
)
SELECT
    tenant_id,
    deactivated_at,
    'update_org_api_key_status',
    jsonb_build_object(
        'kind', 'update_org_api_key_status',
        'data', jsonb_build_object(
            'status', 'disabled'
        )
    ),
    NULL,
    tenant_api_key_id,
    tenant_role_id,
    is_live
FROM deactivation_events;