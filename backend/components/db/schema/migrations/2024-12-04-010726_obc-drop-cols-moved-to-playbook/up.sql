ALTER TABLE ob_configuration
  DROP COLUMN IF EXISTS "tenant_id",
  DROP COLUMN IF EXISTS "is_live",
  DROP COLUMN IF EXISTS "key",
  DROP COLUMN IF EXISTS "status";
