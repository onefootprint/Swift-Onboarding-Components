ALTER TABLE fingerprint
    DROP CONSTRAINT fk_fingerprint_scoped_vault_id;
ALTER TABLE fingerprint
    DROP CONSTRAINT fk_fingerprint_vault_id;
ALTER TABLE fingerprint
    DROP CONSTRAINT fk_fingerprint_tenant_id;