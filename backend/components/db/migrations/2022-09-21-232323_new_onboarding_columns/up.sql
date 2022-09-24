ALTER TABLE onboarding
    ADD COLUMN kyc_status TEXT NOT NULL DEFAULT 'new',
    ADD COLUMN is_liveness_skipped BOOL NOT NULL DEFAULT FALSE,
    ADD COLUMN is_authorized BOOL NOT NULL DEFAULT TRUE;

ALTER TABLE onboarding
    ALTER COLUMN kyc_status DROP DEFAULT,
    ALTER COLUMN is_liveness_skipped DROP DEFAULT,
    ALTER COLUMN is_authorized DROP DEFAULT;
