-- This index will help with the queries in Fingerprint::get_dupes
CREATE INDEX CONCURRENTLY IF NOT EXISTS fingerprint_dupes_query ON fingerprint(is_live, sh_data, tenant_id, vault_id) WHERE deactivated_at IS NULL;