CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS vault_dr_blob_config_id_data_lifetime_id
ON vault_dr_blob(config_id, data_lifetime_id);


