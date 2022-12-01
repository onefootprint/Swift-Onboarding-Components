DROP TABLE user_vault_data;

-- email
ALTER TABLE email
    DROP COLUMN lifetime_id,
    ADD COLUMN user_vault_id TEXT NOT NULL,
    ADD COLUMN fingerprint_ids TEXT[] NOT NULL DEFAULT CAST(ARRAY[] as TEXT[]),
    ADD CONSTRAINT fk_email_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE email ALTER COLUMN fingerprint_ids DROP DEFAULT;

CREATE INDEX IF NOT EXISTS email_user_vault_id ON email(user_vault_id);

-- phone_number
ALTER TABLE phone_number
    DROP COLUMN lifetime_id,
    ADD COLUMN user_vault_id TEXT NOT NULL,
    ADD COLUMN fingerprint_ids TEXT[] NOT NULL DEFAULT CAST(ARRAY[] as TEXT[]),
    ADD CONSTRAINT fk_phone_number_user_vault_id
        FOREIGN KEY(user_vault_id)
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE phone_number ALTER COLUMN fingerprint_ids DROP DEFAULT;

CREATE INDEX IF NOT EXISTS phone_number_user_vault_id ON phone_number(user_vault_id);

-- fingerprint
ALTER TABLE fingerprint
    ADD COLUMN user_vault_id TEXT NOT NULL,
    ADD COLUMN is_unique BOOLEAN NOT NULL,
    ADD COLUMN deactivated_at TIMESTAMPTZ,
    DROP COLUMN lifetime_id,
    ADD CONSTRAINT fk_fingerprint_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE fingerprint RENAME COLUMN kind TO data_attribute;

CREATE INDEX IF NOT EXISTS fingerprint_user_vault_id ON fingerprint(user_vault_id);
CREATE INDEX IF NOT EXISTS fingerprint_sh_data ON fingerprint(sh_data) WHERE deactivated_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS fingerprint_sh_data_unique ON fingerprint(sh_data, data_attribute) WHERE deactivated_at IS NULL AND is_unique = True;

-- verification_request
ALTER TABLE verification_request
    ADD COLUMN email_id TEXT,
    ADD COLUMN phone_number_id TEXT,
    ADD COLUMN identity_data_id TEXT,
    ADD COLUMN identity_document_id TEXT,
    ADD CONSTRAINT fk_verification_request_email_id
        FOREIGN KEY(email_id) 
        REFERENCES email(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_verification_request_phone_number_id
        FOREIGN KEY(phone_number_id) 
        REFERENCES phone_number(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_verification_request_identity_data_id
        FOREIGN KEY(identity_data_id) 
        REFERENCES identity_data(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_verification_request_identity_document_id
        FOREIGN KEY(identity_document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS verification_request_email_id ON verification_request(email_id);
CREATE INDEX IF NOT EXISTS verification_request_phone_number_id ON verification_request(phone_number_id);
CREATE INDEX IF NOT EXISTS verification_request_identity_data_id ON verification_request(identity_data_id);
CREATE INDEX IF NOT EXISTS verification_request_identity_document_id ON verification_request(identity_document_id);

DROP TABLE data_lifetime;
DROP SEQUENCE data_lifetime_seqno;