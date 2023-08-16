SET CONSTRAINTS ALL IMMEDIATE;

-- This is horrible - this table only exists in prod and contains some data we need to backfill
CREATE TABLE IF NOT EXISTS backup_onboardings_08_15 (
    id TEXT PRIMARY KEY,
    scoped_vault_id TEXT,
    workflow_id TEXT
);

-- First, backfill from this backfill table
UPDATE socure_device_session
SET workflow_id = ob.workflow_id
FROM backup_onboardings_08_15 ob
WHERE ob.id = socure_device_session.onboarding_id AND socure_device_session.workflow_id IS NULL;

-- Next, backfill any SDS with a null WF
UPDATE socure_device_session
SET workflow_id = workflow.id
FROM workflow
INNER JOIN onboarding
    ON onboarding.scoped_vault_id = workflow.scoped_vault_id
WHERE onboarding.id = socure_device_session.onboarding_id AND socure_device_session.workflow_id IS NULL;

ALTER TABLE socure_device_session ALTER COLUMN workflow_id SET NOT NULL;