-- This index will help with the queries in Fingerprint::get_dupes.
-- EDIT: It's also probably helping any sh_data queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS fingerprint_dupes_query ON fingerprint(is_live, sh_data, tenant_id, vault_id) WHERE deactivated_at IS NULL;