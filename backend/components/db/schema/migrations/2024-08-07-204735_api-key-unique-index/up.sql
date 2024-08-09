CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS tenant_api_key_sh_unique_index ON tenant_api_key(sh_secret_api_key);

