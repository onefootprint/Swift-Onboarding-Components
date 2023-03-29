ALTER TABLE watchlist_check ALTER COLUMN decision_intent_id DROP NOT NULL;
ALTER TABLE watchlist_check ADD COLUMN status_details jsonb NOT NULL;