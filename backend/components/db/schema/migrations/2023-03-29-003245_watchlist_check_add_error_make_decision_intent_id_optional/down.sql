ALTER TABLE watchlist_check ALTER COLUMN decision_intent_id SET NOT NULL;
ALTER TABLE watchlist_check DROP COLUMN status_details;