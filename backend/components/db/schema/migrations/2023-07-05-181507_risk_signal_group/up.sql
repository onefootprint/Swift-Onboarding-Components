CREATE TABLE risk_signal_group (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('rsg_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL,
    scoped_vault_id TEXT NOT NULL,    
    kind TEXT NOT NULL,

    CONSTRAINT fk_risk_signal_group_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('risk_signal_group');
CREATE INDEX IF NOT EXISTS risk_signal_group_scoped_vault_id ON risk_signal_group(scoped_vault_id);
CREATE INDEX IF NOT EXISTS risk_signal_group_scoped_vault_id_kind ON risk_signal_group(scoped_vault_id, kind);

ALTER TABLE risk_signal
    ADD COLUMN risk_signal_group_id TEXT,
    ADD CONSTRAINT fk_risk_signal_risk_signal_group_id
        FOREIGN KEY(risk_signal_group_id)
        REFERENCES risk_signal_group(id)
        DEFERRABLE INITIALLY DEFERRED;
    
CREATE INDEX risk_signal_risk_signal_group_id ON risk_signal(risk_signal_group_id);

