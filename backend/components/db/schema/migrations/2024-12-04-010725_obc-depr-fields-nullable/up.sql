ALTER TABLE ob_configuration
  ALTER COLUMN "tenant_id" DROP NOT NULL,
  ALTER COLUMN "is_live" DROP NOT NULL,
  ALTER COLUMN "key" DROP NOT NULL,
  ALTER COLUMN "status" DROP NOT NULL;
