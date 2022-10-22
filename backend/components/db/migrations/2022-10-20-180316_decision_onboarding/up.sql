ALTER TABLE onboarding DROP COLUMN latest_decision_id;
ALTER TABLE onboarding_decision ADD COLUMN deactivated_at TIMESTAMPTZ; 