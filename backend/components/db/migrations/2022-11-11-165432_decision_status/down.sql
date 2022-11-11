ALTER TABLE onboarding_decision
    ADD COLUMN verification_status TEXT,
    ADD COLUMN compliance_status TEXT;

UPDATE onboarding_decision SET
    -- Losing some information from up.sql, but not important
    compliance_status = 'not_applicable',
    verification_status = CASE
        WHEN status = 'pass' THEN 'verified'
        WHEN status = 'fail' THEN 'failed'
        WHEN status = 'step_up_required' THEN 'needs_id_document'
    END;

ALTER TABLE onboarding_decision
    ALTER COLUMN verification_status SET NOT NULL,
    ALTER COLUMN compliance_status SET NOT NULL,
    DROP COLUMN status;