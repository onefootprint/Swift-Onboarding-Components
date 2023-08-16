CREATE TABLE IF NOT EXISTS backup_onboardings AS SELECT * FROM onboarding;
ALTER TABLE backup_onboardings ADD CONSTRAINT backup_onboardings_pk PRIMARY KEY (id);

ALTER TABLE onboarding
    DROP COLUMN IF EXISTS insight_event_id,
    DROP COLUMN IF EXISTS authorized_at,
    DROP COLUMN IF EXISTS idv_reqs_initiated_at,
    DROP COLUMN IF EXISTS decision_made_at,
    DROP COLUMN IF EXISTS workflow_id;