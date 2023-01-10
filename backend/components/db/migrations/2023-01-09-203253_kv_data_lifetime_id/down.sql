-- No one is using this table yet, can truncate it to not have to backfill lifetime_id
TRUNCATE TABLE kv_data;

ALTER TABLE kv_data
    DROP COLUMN lifetime_id,
    ADD COLUMN user_vault_id TEXT NOT NULL,
    ADD COLUMN tenant_id TEXT NOT NULL,
    ADD COLUMN deactivated_at TIMESTAMPTZ,
    ADD CONSTRAINT fk_kv_data_user_vault_id
        FOREIGN KEY(user_vault_id) 
        REFERENCES user_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_kv_data_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS kv_data_user_vault ON kv_data(user_vault_id);
CREATE INDEX IF NOT EXISTS kv_data_tenant ON kv_data(tenant_id);