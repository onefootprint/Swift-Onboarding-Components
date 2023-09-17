-- Get workflows made 15 mins ago that are stuck in an incomplete state
SELECT
    scoped_vault.fp_id,
    tenant.name as tenant_name,
    workflow.created_at as workflow_created_at,
    workflow.status as workflow_status,
    workflow.state as workflow_state,
    workflow.authorized_at is not null as is_authorized,
    workflow.decision_made_at is not null as is_decision_made
FROM workflow
INNER JOIN scoped_vault
    ON scoped_vault.id = workflow.scoped_vault_id
INNER JOIN tenant  
    ON tenant.id = scoped_vault.tenant_id
WHERE
    scoped_vault.is_live AND
    tenant.is_demo_tenant = 'f' AND
    workflow.status IN ('incomplete', 'pending') AND
    workflow.created_at < current_timestamp - '15 minutes'::interval AND
    -- We run every 30 mins, look back 15 minutes, and have a buffer of 5 mins
    workflow.created_at > current_timestamp - '50 minutes'::interval
ORDER BY workflow.created_at DESC;