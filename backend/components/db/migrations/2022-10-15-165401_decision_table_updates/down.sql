ALTER TABLE onboarding RENAME status TO kyc_status;
ALTER TABLE onboarding DROP COLUMN latest_decision_id;

DROP TABLE risk_signal;
DROP TABLE onboarding_decision_verification_result_junction;
DROP TABLE onboarding_decision;