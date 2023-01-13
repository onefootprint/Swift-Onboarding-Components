ALTER TABLE user_consent DROP COLUMN document_request_id;
ALTER TABLE user_consent DROP COLUMN user_vault_id;
ALTER TABLE user_consent DROP COLUMN scoped_user_id;
ALTER TABLE user_consent ADD COLUMN onboarding_id TEXT NOT NULL;

ALTER TABLE user_consent 
    ADD CONSTRAINT fk_user_consent_onboarding_id
        FOREIGN KEY(onboarding_id)
        REFERENCES onboarding(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS user_consent_onboarding_id ON user_consent(onboarding_id);
