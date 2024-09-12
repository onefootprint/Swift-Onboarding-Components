ALTER TABLE webauthn_credential ADD COLUMN origin_id TEXT;
ALTER TABLE webauthn_credential
    ADD CONSTRAINT fk_webauthn_credential_origin_id
        FOREIGN KEY(origin_id) 
        REFERENCES webauthn_credential(id)
        DEFERRABLE INITIALLY DEFERRED;