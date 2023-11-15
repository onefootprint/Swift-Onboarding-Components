SELECT
    scoped_vault.fp_id,
    tenant.name as tenant_name,
    workflow.id as workflow_id,
    workflow.created_at as workflow_created_at,
    workflow.completed_at as workflow_completed_at,
    workflow.status as workflow_status,
    workflow.state as workflow_state
FROM workflow
-- Will only get workflows with an insight event
INNER JOIN insight_event
    ON insight_event.id = workflow.insight_event_id
INNER JOIN scoped_vault
    ON scoped_vault.id = workflow.scoped_vault_id
INNER JOIN tenant  
    ON tenant.id = scoped_vault.tenant_id
WHERE
    scoped_vault.is_live AND
    tenant.is_demo_tenant = 'f' AND
    tenant.id != 'org_e2FHVfOM5Hd3Ce492o5Aat' AND
    -- Workflows completed within the time range
    workflow.completed_at IS NOT NULL AND
    workflow.completed_at >= :start_datetime AND
    workflow.completed_at < :end_datetime AND
    -- Workflows that are not validated (via tenant API call to /onboarding/session/validate)
    workflow.session_validated_at IS NULL AND
    -- Filter out KYB workflows, which we aren't marking as validated
    workflow.kind != 'kyb' AND
    -- Filter out workflows made on hosted bifrost, which will never be validated
    insight_event.origin NOT IN ('https://verify.onefootprint.com', 'https://verify.onefootprint.com/')
ORDER BY workflow.completed_at DESC;