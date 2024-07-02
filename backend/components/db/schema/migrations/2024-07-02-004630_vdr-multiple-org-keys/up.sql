ALTER TABLE vault_dr_config ADD COLUMN org_public_keys TEXT[];

UPDATE vault_dr_config SET org_public_keys = ARRAY[org_public_key] WHERE org_public_keys IS NULL;

ALTER TABLE vault_dr_config ALTER COLUMN org_public_keys SET NOT NULL;
ALTER TABLE vault_dr_config ADD CONSTRAINT vault_dr_config_org_public_keys_not_empty CHECK (array_length(org_public_keys, 1) > 0);

ALTER TABLE vault_dr_config DROP COLUMN org_public_key;
