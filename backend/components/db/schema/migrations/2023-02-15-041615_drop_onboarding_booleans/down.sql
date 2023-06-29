ALTER TABLE onboarding
    ADD COLUMN is_authorized BOOLEAN,
    ADD COLUMN has_final_decision BOOLEAN,
    ADD COLUMN idv_reqs_initiated BOOLEAN;

UPDATE onboarding SET is_authorized = 't' WHERE authorized_at IS NOT NULL;
UPDATE onboarding SET has_final_decision = 't' WHERE decision_made_at IS NOT NULL;
UPDATE onboarding SET idv_reqs_initiated = 't' WHERE idv_reqs_initiated_at IS NOT NULL;