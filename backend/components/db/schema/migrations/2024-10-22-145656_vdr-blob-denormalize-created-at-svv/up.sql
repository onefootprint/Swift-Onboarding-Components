ALTER TABLE vault_dr_blob ADD COLUMN dl_created_at_svv_id TEXT;

ALTER TABLE vault_dr_blob
ADD CONSTRAINT fk_vault_dr_blob_dl_created_at_svv_id
    FOREIGN KEY (dl_created_at_svv_id)
    REFERENCES scoped_vault_version(id)
    DEFERRABLE INITIALLY DEFERRED;
