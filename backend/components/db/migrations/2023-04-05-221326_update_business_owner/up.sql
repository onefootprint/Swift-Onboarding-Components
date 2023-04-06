ALTER TABLE business_owner
    ALTER COLUMN user_vault_id DROP NOT NULL,
    ADD COLUMN kind TEXT NOT NULL DEFAULT 'primary',
    ADD COLUMN link_id TEXT NOT NULL DEFAULT prefixed_uid('bo_link_'),
    ADD COLUMN _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Don't allow primary BOs to have a null user vault ID
    ADD CONSTRAINT business_owner_primary_has_user_vault_id CHECK ((kind != 'primary') OR (user_vault_id IS NOT NULL));

ALTER TABLE business_owner
    ALTER COLUMN kind DROP DEFAULT,
    ALTER COLUMN link_id DROP DEFAULT;

DROP TRIGGER IF EXISTS set_updated_at ON business_owner;

SELECT diesel_manage_updated_at('business_owner');