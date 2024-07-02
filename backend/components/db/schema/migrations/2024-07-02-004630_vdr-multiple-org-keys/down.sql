ALTER TABLE vault_dr_config ADD COLUMN org_public_key TEXT;

UPDATE vault_dr_config SET org_public_key = org_public_keys[1];

ALTER TABLE vault_dr_config DROP CONSTRAINT vault_dr_config_org_public_keys_not_empty;
ALTER TABLE vault_dr_config ALTER COLUMN org_public_keys DROP NOT NULL;

ALTER TABLE vault_dr_config DROP COLUMN org_public_keys;
