-- TODO MUST BACKFILL THIS IN CHUNKS BEFORE LANDING
UPDATE vault SET is_verified = 't'
FROM scoped_vault
WHERE
    vault.is_verified IS NULL AND
    scoped_vault.show_in_search = 't' AND
    vault.id = scoped_vault.vault_id;

UPDATE vault SET is_verified = 'f' WHERE vault.is_verified IS NULL;

UPDATE vault SET created_at = _created_at WHERE created_at IS NULL;