DELETE FROM manual_review WHERE onboarding_id IS NULL;

ALTER TABLE manual_review
    DROP COLUMN workflow_id,
    DROP COLUMN scoped_vault_id,
    ALTER COLUMN onboarding_id SET NOT NULL;