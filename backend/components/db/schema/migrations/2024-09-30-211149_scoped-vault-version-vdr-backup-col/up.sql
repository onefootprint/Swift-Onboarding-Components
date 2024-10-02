ALTER TABLE scoped_vault_version
    ADD COLUMN backed_up_by_vdr_config_id TEXT;

ALTER TABLE scoped_vault_version
    ADD CONSTRAINT fk_backed_up_by_vdr_config_id
    FOREIGN KEY (backed_up_by_vdr_config_id)
    REFERENCES vault_dr_config(id);
