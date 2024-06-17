CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_config_tenant_id_is_live ON vault_dr_config(tenant_id, is_live);
DROP INDEX vault_dr_config_tenant_id_is_live_active;
