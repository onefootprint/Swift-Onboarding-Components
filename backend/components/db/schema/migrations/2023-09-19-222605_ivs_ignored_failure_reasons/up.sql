-- TODO drop default

ALTER TABLE incode_verification_session
    ADD COLUMN ignored_failure_reasons TEXT[] NOT NULL DEFAULT CAST(ARRAY[] AS TEXT[]);