UPDATE risk_signal
SET verification_result_id = NULL
WHERE onboarding_decision_id IS NOT NULL;