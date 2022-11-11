ALTER TABLE onboarding_decision ADD COLUMN status TEXT;

-- Both existing compliance_status cases are a pass
UPDATE onboarding_decision SET status = CASE 
    WHEN verification_status = 'verified' THEN 'pass'
    -- Should have removed manual_review earlier
    WHEN verification_status = 'manual_review' THEN 'fail'
    WHEN verification_status = 'failed' THEN 'fail'
    WHEN verification_status = 'needs_id_document' THEN 'step_up_required'
END;

ALTER TABLE onboarding_decision
    ALTER COLUMN status SET NOT NULL,
    DROP COLUMN verification_status,
    DROP COLUMN compliance_status;
