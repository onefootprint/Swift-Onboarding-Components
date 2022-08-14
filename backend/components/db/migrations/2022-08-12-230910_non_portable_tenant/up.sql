ALTER TABLE user_vaults
    ADD COLUMN is_portable BOOLEAN;

UPDATE user_vaults SET is_portable = True;

ALTER TABLE user_vaults ALTER COLUMN is_portable SET NOT NULL;