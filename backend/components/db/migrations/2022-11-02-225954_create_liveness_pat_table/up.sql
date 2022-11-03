CREATE TABLE liveness_event (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('liveness_'),
    onboarding_id UUID NOT NULL,
    liveness_source TEXT NOT NULL,
    attributes jsonb,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_liveness_onboarding_id
        FOREIGN KEY(onboarding_id)
        REFERENCES onboarding(id)
);

CREATE INDEX IF NOT EXISTS user_liveness_event_onboarding_id ON liveness_event(onboarding_id);

SELECT diesel_manage_updated_at('liveness_event');