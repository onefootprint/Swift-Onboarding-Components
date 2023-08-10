-- TODO how do we backfill workflows triggered on dashboard? they'll always be null for now
-- If the status is still a decision status, we can status the workflow status to the decision status
-- made at the same time
UPDATE workflow
SET status = ob.status, ob_configuration_id = ob.ob_configuration_id, authorized_at = ob.authorized_at, insight_event_id = ob.insight_event_id
FROM onboarding ob
WHERE ob.workflow_id = workflow.id;

UPDATE scoped_vault
SET status = ob.status
FROM onboarding ob
WHERE ob.scoped_vault_id = scoped_vault.id;