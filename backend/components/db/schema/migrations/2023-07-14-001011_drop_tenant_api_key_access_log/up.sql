DROP TABLE IF EXISTS tenant_api_key_access_log;
-- Just forgot to do this earlier
DROP TABLE IF EXISTS data_lifetime_backup;
-- And sneaking this one in
CREATE INDEX IF NOT EXISTS session_key ON session(key);