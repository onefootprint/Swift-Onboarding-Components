ALTER TABLE watchlist_check 
    ADD COLUMN workflow_id TEXT,
    ADD CONSTRAINT fk_watchlist_check_workflow_id
        FOREIGN KEY (workflow_id) 
        REFERENCES workflow (id)
        DEFERRABLE INITIALLY DEFERRED NOT VALID;