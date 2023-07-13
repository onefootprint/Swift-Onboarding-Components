SELECT diesel_manage_updated_at('tenant_api_key_access_log');
DROP INDEX tenant_api_key_sh_index;

ALTER TABLE tenant_api_key DROP COLUMN last_used_at;