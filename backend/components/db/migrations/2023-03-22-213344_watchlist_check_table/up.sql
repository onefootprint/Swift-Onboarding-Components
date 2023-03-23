
CREATE TABLE watchlist_check (
    id text PRIMARY KEY DEFAULT prefixed_uid('wc_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL,

    scoped_vault_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    decision_intent_id TEXT NOT NULL,
    status TEXT NOT NULL,
    logic_git_hash TEXT,

    CONSTRAINT fk_watchlist_check_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_watchlist_check_task_id
        FOREIGN KEY(task_id) 
        REFERENCES task(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_watchlist_check_decision_intent_id
        FOREIGN KEY(decision_intent_id) 
        REFERENCES decision_intent(id)
        DEFERRABLE INITIALLY DEFERRED

);

SELECT diesel_manage_updated_at('watchlist_check');
CREATE INDEX IF NOT EXISTS watchlist_check_scoped_vault_id ON watchlist_check(scoped_vault_id);
CREATE INDEX IF NOT EXISTS watchlist_check_task_id ON watchlist_check(task_id);
CREATE INDEX IF NOT EXISTS watchlist_check_decision_intent_id ON watchlist_check(decision_intent_id);
