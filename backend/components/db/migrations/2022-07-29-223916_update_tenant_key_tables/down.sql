-- ob_configurations update
ALTER TABLE ob_configurations ADD COLUMN description TEXT;
ALTER TABLE ob_configurations ADD COLUMN settings JSONB DEFAULT CAST('{}' AS JSONB) NOT NULL;
ALTER TABLE ob_configurations ALTER COLUMN settings DROP DEFAULT;

ALTER TABLE ob_configurations ADD COLUMN is_disabled BOOLEAN;
UPDATE ob_configurations SET is_disabled = CASE WHEN status = 'Enabled' THEN false ELSE true END;
ALTER TABLE ob_configurations ALTER COLUMN is_disabled SET NOT NULL;
ALTER TABLE ob_configurations DROP COLUMN status;

ALTER TABLE ob_configurations DROP COLUMN created_at;

-- tenant_api_keys update
ALTER TABLE tenant_api_keys ADD COLUMN is_enabled BOOLEAN;
UPDATE tenant_api_keys SET is_enabled = CASE WHEN status = 'Enabled' THEN true ELSE false END;
ALTER TABLE tenant_api_keys ALTER COLUMN is_enabled SET NOT NULL;
ALTER TABLE tenant_api_keys DROP COLUMN status;

ALTER TABLE tenant_api_keys DROP COLUMN name;

ALTER TABLE tenant_api_keys DROP COLUMN created_at;