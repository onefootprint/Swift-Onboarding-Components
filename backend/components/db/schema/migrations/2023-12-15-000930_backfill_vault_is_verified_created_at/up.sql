-- TODO MUST BACKFILL THIS IN CHUNKS BEFORE LANDING
UPDATE vault
SET is_verified = 't'
FROM data_lifetime
INNER JOIN contact_info ON lifetime_id = data_lifetime.id
WHERE
    vault.is_verified IS NULL AND
    contact_info.is_otp_verified = 't' AND
    vault.id = data_lifetime.vault_id;

UPDATE vault SET is_verified = 'f' WHERE vault.is_verified IS NULL;

UPDATE vault SET created_at = _created_at WHERE created_at IS NULL;