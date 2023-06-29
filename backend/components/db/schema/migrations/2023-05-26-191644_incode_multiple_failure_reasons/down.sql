ALTER TABLE incode_verification_session
    ADD COLUMN latest_failure_reason TEXT;

UPDATE incode_verification_session
SET latest_failure_reason = latest_failure_reasons[1]
WHERE ARRAY_LENGTH(latest_failure_reasons, 1) > 0;

ALTER TABLE incode_verification_session
    DROP COLUMN latest_failure_reasons;

-- Also update the event table
ALTER TABLE incode_verification_session_event
    ADD COLUMN latest_failure_reason TEXT;

UPDATE incode_verification_session_event
SET latest_failure_reason = latest_failure_reasons[1]
WHERE ARRAY_LENGTH(latest_failure_reasons, 1) > 0;

ALTER TABLE incode_verification_session_event
    DROP COLUMN latest_failure_reasons;