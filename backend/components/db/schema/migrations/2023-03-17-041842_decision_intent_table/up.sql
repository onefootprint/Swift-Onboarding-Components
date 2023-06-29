CREATE TABLE decision_intent (
    id text PRIMARY KEY DEFAULT prefixed_uid('di_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at timestamptz NOT NULL,
    kind TEXT NOT NULL,
    scoped_vault_id TEXT NOT NULL,

    CONSTRAINT fk_decision_intent_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED

);

SELECT diesel_manage_updated_at('decision_intent');
CREATE INDEX IF NOT EXISTS decision_intent_scoped_vault_id ON decision_intent(scoped_vault_id);