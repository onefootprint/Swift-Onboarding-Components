DELETE FROM business_owner WHERE user_vault_id IS NULL;

ALTER TABLE business_owner
    ALTER COLUMN user_vault_id SET NOT NULL,
    DROP COLUMN kind,
    DROP COLUMN link_id,
    DROP COLUMN _created_at,
    DROP COLUMN _updated_at;