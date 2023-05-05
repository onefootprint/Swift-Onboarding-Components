CREATE TABLE incode_verification_session (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('ivs_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL,
    scoped_vault_id TEXT NOT NULL,
    
    incode_session_id TEXT,
    -- we control this, so know it on create
    incode_configuration_id TEXT NOT NULL,
    incode_authentication_token TEXT,
    incode_authentication_token_expires_at TIMESTAMPTZ,
    
    identity_document_id TEXT NOT NULL,
    state TEXT NOT NULL,
    completed_at timestamptz,
    
    CONSTRAINT fk_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_identity_document_id
        FOREIGN KEY(identity_document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('incode_verification_session');
CREATE INDEX IF NOT EXISTS incode_verification_session_scoped_vault_id ON incode_verification_session(scoped_vault_id);
CREATE INDEX IF NOT EXISTS incode_verification_session_identity_document_id ON incode_verification_session(identity_document_id);


CREATE TABLE incode_verification_session_event (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('ivse_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL,
    incode_verification_session_id TEXT NOT NULL,
    incode_verification_session_state TEXT NOT NULL,

    identity_document_id TEXT NOT NULL,

    CONSTRAINT fk_incode_verification_session_id
        FOREIGN KEY(incode_verification_session_id) 
        REFERENCES incode_verification_session(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_identity_document_id
        FOREIGN KEY(identity_document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED
);
SELECT diesel_manage_updated_at('incode_verification_session_event');

CREATE INDEX IF NOT EXISTS incode_verification_session_event_incode_verification_session_id ON incode_verification_session_event(incode_verification_session_id);
CREATE INDEX IF NOT EXISTS incode_verification_session_event_identity_document_id ON incode_verification_session_event(identity_document_id);