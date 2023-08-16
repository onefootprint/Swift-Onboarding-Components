SET CONSTRAINTS ALL IMMEDIATE;

WITH wf_ob AS (
    SELECT w.id, uc.onboarding_id
    FROM user_consent uc
    JOIN onboarding o on o.id = uc.onboarding_id
    JOIN workflow w on w.scoped_vault_id = o.scoped_vault_id
)
UPDATE user_consent uc
SET workflow_id = w.id
FROM wf_ob w
WHERE uc.onboarding_id = w.onboarding_id;

ALTER TABLE user_consent ALTER COLUMN workflow_id SET NOT NULL;
ALTER TABLE user_consent ALTER COLUMN onboarding_id DROP NOT NULL;
