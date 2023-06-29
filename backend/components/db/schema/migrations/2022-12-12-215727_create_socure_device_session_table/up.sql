CREATE TABLE socure_device_session (
    id text PRIMARY KEY DEFAULT prefixed_uid('sds_'),
    onboarding_id TEXT NOT NULL,
    device_session_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    _created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_socure_device_session_onboarding_id 
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED
)
