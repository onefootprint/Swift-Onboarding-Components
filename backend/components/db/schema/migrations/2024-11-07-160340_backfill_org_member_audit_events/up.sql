-- Delete existing invite events
DELETE FROM audit_event
WHERE name = 'invite_org_member';

-- Insert invite events
WITH first_rolebindings AS (
    SELECT DISTINCT ON (tenant_user_id, tenant_role_id)
        tenant_user_id,
        tenant_role_id,
        created_at
    FROM tenant_rolebinding
    WHERE tenant_id IS NOT NULL
    ORDER BY tenant_user_id, tenant_role_id, created_at ASC
),
invite_events AS (
    SELECT
        tr.tenant_id,
        tr.id as tenant_role_id,
        frb.created_at as timestamp,
        tu.id as tenant_user_id,
        tu.email,
        tu.first_name,
        tu.last_name,
        tr.name as tenant_role_name,
        tr.scopes
    FROM tenant_role tr
    JOIN tenant_rolebinding trb ON trb.tenant_role_id = tr.id
    JOIN tenant_user tu ON tu.id = trb.tenant_user_id
    JOIN first_rolebindings frb ON frb.tenant_role_id = tr.id AND frb.tenant_user_id = tu.id
)
INSERT INTO audit_event (
    tenant_id,
    timestamp,
    name,
    metadata,
    principal_actor,
    tenant_role_id,
    tenant_user_id
)
SELECT
    tenant_id,
    timestamp,
    'org_member_joined',
    jsonb_build_object(
        'kind', 'org_member_joined'
    ),
    NULL::jsonb,
    tenant_role_id,
    tenant_user_id
FROM invite_events;