-- NOTE: in prod, I've already tricked diesel into thinking this migration is run
ALTER TABLE fingerprint
    VALIDATE CONSTRAINT fk_fingerprint_scoped_vault_id;
ALTER TABLE fingerprint
    VALIDATE CONSTRAINT fk_fingerprint_vault_id;
ALTER TABLE fingerprint
    VALIDATE CONSTRAINT fk_fingerprint_tenant_id;