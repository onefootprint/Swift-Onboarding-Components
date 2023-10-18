ALTER TABLE incode_verification_session_event
    ADD COLUMN ignored_failure_reasons TEXT[] NOT NULL DEFAULT CAST(ARRAY[] AS TEXT[]);