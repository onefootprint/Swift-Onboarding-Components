-- Normally need to do this in smaller steps, but this table is small enough
ALTER TABLE webauthn_credential
  ADD CONSTRAINT fk_webauthn_credential_scoped_vault_id
    FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED;