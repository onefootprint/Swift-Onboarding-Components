CREATE TABLE user_consent (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('usrc_'),
    timestamp TIMESTAMPTZ NOT NULL,
    user_vault_id TEXT NOT NULL,
    scoped_user_id TEXT NOT NULL,
    document_request_id TEXT NOT NULL,
    insight_event_id TEXT NOT NULL,
    consent_language_text TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_consent_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_user_consent_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_user_consent_document_request_id
        FOREIGN KEY(document_request_id)
        REFERENCES document_request(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_user_consent_insight_event_id
        FOREIGN KEY(insight_event_id)
        REFERENCES insight_event(id)
        DEFERRABLE INITIALLY DEFERRED
);