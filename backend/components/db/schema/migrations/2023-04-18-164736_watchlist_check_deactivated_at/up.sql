ALTER TABLE watchlist_check ADD COLUMN deactivated_at TIMESTAMPTZ;

-- Only one completed, active watchlist check per scoped user
CREATE UNIQUE INDEX watchlist_check_single_active ON watchlist_check(scoped_vault_id) WHERE completed_at IS NOT NULL and deactivated_at IS NULL;