CREATE TABLE fingerprint_visit_event (
    id text PRIMARY KEY DEFAULT prefixed_uid('fpvt_'),
    visitor_id TEXT NOT NULL,
    user_vault_id TEXT, -- null before we finish sms OTP
    scoped_user_id TEXT, -- null before we finish sms OTP
    path TEXT NOT NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_fingerprint_visit_event_user_vault_id
       FOREIGN KEY(user_vault_id) 
       REFERENCES user_vault(id)
       DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_fingerprint_visit_event_scoped_user_id
        FOREIGN KEY(scoped_user_id) 
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED

);
CREATE INDEX IF NOT EXISTS fingerprint_visit_event_user_vault_id ON fingerprint_visit_event(user_vault_id);
CREATE INDEX IF NOT EXISTS fingerprint_visit_event_scoped_user_id ON fingerprint_visit_event(scoped_user_id);
SELECT diesel_manage_updated_at('fingerprint_visit_event');
