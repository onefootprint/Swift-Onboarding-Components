-- NOTE: in prod, I've already tricked diesel into thinking this migration is run
ALTER TABLE fingerprint
    ADD CONSTRAINT fk_fingerprint_scoped_vault_id
    FOREIGN KEY(scoped_vault_id) 
    REFERENCES scoped_vault(id)
    DEFERRABLE INITIALLY DEFERRED NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT fk_fingerprint_vault_id
    FOREIGN KEY(vault_id) 
    REFERENCES vault(id)
    DEFERRABLE INITIALLY DEFERRED NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT fk_fingerprint_tenant_id
    FOREIGN KEY(tenant_id) 
    REFERENCES tenant(id)
    DEFERRABLE INITIALLY DEFERRED NOT VALID;