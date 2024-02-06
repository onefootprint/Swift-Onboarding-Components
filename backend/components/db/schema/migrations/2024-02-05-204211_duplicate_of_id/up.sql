ALTER TABLE vault
    ADD COLUMN duplicate_of_id TEXT,
    ADD CONSTRAINT fk_vault_duplicate_of_id
        FOREIGN KEY(duplicate_of_id) 
        REFERENCES vault(id)
        DEFERRABLE INITIALLY DEFERRED;