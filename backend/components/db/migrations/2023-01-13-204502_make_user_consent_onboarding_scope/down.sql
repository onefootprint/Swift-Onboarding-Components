ALTER TABLE user_consent DROP COLUMN onboarding_id; 
ALTER TABLE user_consent ADD COLUMN user_vault_id TEXT NOT NULL;
ALTER TABLE user_consent ADD COLUMN scoped_user_id TEXT NOT NULL;
ALTER TABLE user_consent ADD COLUMN document_request_id TEXT NOT NULL;

ALTER TABLE user_consent 
    ADD CONSTRAINT fk_user_consent_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE user_consent 
    ADD CONSTRAINT fk_user_consent_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE user_consent 
    ADD CONSTRAINT fk_user_consent_document_request_id
        FOREIGN KEY(document_request_id)
        REFERENCES document_request(id)
        DEFERRABLE INITIALLY DEFERRED;
