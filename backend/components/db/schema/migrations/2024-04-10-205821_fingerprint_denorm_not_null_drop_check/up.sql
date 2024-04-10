ALTER TABLE fingerprint
    DROP CONSTRAINT scoped_vault_id_not_null;
ALTER TABLE fingerprint
    DROP CONSTRAINT vault_id_not_null;
ALTER TABLE fingerprint
    DROP CONSTRAINT tenant_id_not_null;
ALTER TABLE fingerprint
    DROP CONSTRAINT is_live_not_null;