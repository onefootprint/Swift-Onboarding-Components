ALTER TABLE vault_dr_config ADD COLUMN bucket_path_namespace TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '');

CREATE UNIQUE INDEX IF NOT EXISTS vault_dr_config_bucket_bucket_path_namespace
  ON vault_dr_config(s3_bucket_name, bucket_path_namespace);

-- Shortcut: no prod writes to this table, so can drop the default in the same migration.
ALTER TABLE vault_dr_config ALTER COLUMN bucket_path_namespace DROP DEFAULT;
