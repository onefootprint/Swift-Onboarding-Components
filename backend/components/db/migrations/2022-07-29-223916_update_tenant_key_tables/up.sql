-- ob_configurations update
ALTER TABLE ob_configurations DROP COLUMN description;
ALTER TABLE ob_configurations DROP COLUMN settings;

ALTER TABLE ob_configurations ADD COLUMN status TEXT;
UPDATE ob_configurations SET status = CASE WHEN is_disabled = false THEN 'Enabled' ELSE 'Disabled' END;
ALTER TABLE ob_configurations ALTER COLUMN status SET NOT NULL;
ALTER TABLE ob_configurations DROP COLUMN is_disabled;

ALTER TABLE ob_configurations ADD COLUMN created_at TIMESTAMPTZ;
UPDATE ob_configurations SET created_at = _created_at;
ALTER TABLE ob_configurations ALTER COLUMN created_at SET NOT NULL;

-- tenant_api_keys update
ALTER TABLE tenant_api_keys ADD COLUMN status TEXT;
UPDATE tenant_api_keys SET status = CASE WHEN is_enabled = true THEN 'Enabled' ELSE 'Disabled' END;
ALTER TABLE tenant_api_keys ALTER COLUMN status SET NOT NULL;
ALTER TABLE tenant_api_keys DROP COLUMN is_enabled;

ALTER TABLE tenant_api_keys ADD COLUMN name TEXT;
UPDATE tenant_api_keys SET name = tenants.name FROM tenants WHERE tenants.id = tenant_api_keys.tenant_id;
ALTER TABLE tenant_api_keys ALTER COLUMN name SET NOT NULL;

ALTER TABLE tenant_api_keys ADD COLUMN created_at TIMESTAMPTZ;
UPDATE tenant_api_keys SET created_at = _created_at;
ALTER TABLE tenant_api_keys ALTER COLUMN created_at SET NOT NULL;