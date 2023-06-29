ALTER TABLE incode_verification_session
    ADD COLUMN latest_failure_reasons TEXT[] NOT NULL DEFAULT CAST(ARRAY[] AS TEXT[]);

UPDATE incode_verification_session
SET latest_failure_reasons = ARRAY[latest_failure_reason]
WHERE latest_failure_reason IS NOT NULL;

ALTER TABLE incode_verification_session
    ALTER COLUMN latest_failure_reasons DROP DEFAULT,
    DROP COLUMN latest_failure_reason;

-- Also update the event table

ALTER TABLE incode_verification_session_event
    ADD COLUMN latest_failure_reasons TEXT[] NOT NULL DEFAULT CAST(ARRAY[] AS TEXT[]);

UPDATE incode_verification_session_event
SET latest_failure_reasons = ARRAY[latest_failure_reason]
WHERE latest_failure_reason IS NOT NULL;

ALTER TABLE incode_verification_session_event
    ALTER COLUMN latest_failure_reasons DROP DEFAULT,
    DROP COLUMN latest_failure_reason;