ALTER TABLE fingerprint
    ADD CONSTRAINT scoped_vault_id_not_null CHECK(scoped_vault_id IS NOT NULL) NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT vault_id_not_null CHECK(vault_id IS NOT NULL) NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT tenant_id_not_null CHECK(tenant_id IS NOT NULL) NOT VALID;
ALTER TABLE fingerprint
    ADD CONSTRAINT is_live_not_null CHECK(is_live IS NOT NULL) NOT VALID;