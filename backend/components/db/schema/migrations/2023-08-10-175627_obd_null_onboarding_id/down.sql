SET CONSTRAINTS ALL IMMEDIATE;

DELETE FROM onboarding_decision WHERE onboarding_id IS NULL;
ALTER TABLE onboarding_decision ALTER COLUMN onboarding_id SET NOT NULL;