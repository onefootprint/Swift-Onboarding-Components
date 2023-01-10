-- No one is using this table yet, can truncate it to not have to backfill lifetime_id
TRUNCATE TABLE kv_data;

ALTER TABLE kv_data
    ADD COLUMN lifetime_id TEXT NOT NULL,
    DROP COLUMN user_vault_id,
    DROP COLUMN tenant_id,
    DROP COLUMN deactivated_at,
    ADD CONSTRAINT fk_user_vault_data_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS kv_data_lifetime_id ON kv_data(lifetime_id);
-- TODO uniqueness index on one key per (user, tenant)