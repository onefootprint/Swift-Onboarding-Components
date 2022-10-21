CREATE TABLE user_timeline (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('ut_'),
    onboarding_id UUID NOT NULL,
    event jsonb NOT NULL,
    timestamp timestamptz NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_timeline_onboarding_id
        FOREIGN KEY(onboarding_id)
        REFERENCES onboarding(id)
);

CREATE INDEX IF NOT EXISTS user_timeline_onboarding_id ON user_timeline(onboarding_id);

SELECT diesel_manage_updated_at('user_timeline');