CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS workflow_one_active_per_scoped_vault_non_adhoc ON workflow (scoped_vault_id) WHERE deactivated_at is NULL AND kind != 'adhoc_vendor_call';
