DROP TRIGGER IF EXISTS set_updated_at ON tenant_api_key_access_log;
CREATE INDEX IF NOT EXISTS tenant_api_key_sh_index ON tenant_api_key(sh_secret_api_key);

ALTER TABLE tenant_api_key ADD COLUMN last_used_at TIMESTAMPTZ;

UPDATE tenant_api_key
SET last_used_at = (SELECT MAX(timestamp) FROM tenant_api_key_access_log WHERE tenant_api_key_id=tenant_api_key.id)
WHERE last_used_at IS NULL;