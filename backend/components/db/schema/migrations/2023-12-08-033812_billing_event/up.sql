ALTER TABLE billing_profile
    ADD COLUMN adverse_media_per_user TEXT,
    ADD COLUMN continuous_monitoring_per_year TEXT;

CREATE TABLE billing_event (
    id text PRIMARY KEY DEFAULT prefixed_uid('be_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timestamp TIMESTAMPTZ NOT NULL,
    kind TEXT NOT NULL,
    scoped_vault_id TEXT NOT NULL,
    ob_configuration_id TEXT NOT NULL,
    existing_event_id TEXT,
    CONSTRAINT fk_billing_event_scoped_vault_id
        FOREIGN KEY(scoped_vault_id)
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_billing_event_ob_configuration_id
        FOREIGN KEY(ob_configuration_id)
        REFERENCES ob_configuration(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_billing_event_existing_event_id
        FOREIGN KEY(existing_event_id)
        REFERENCES billing_event(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS billing_event_scoped_vault_id ON billing_event(scoped_vault_id);
CREATE INDEX IF NOT EXISTS billing_event_ob_configuration_id ON billing_event(ob_configuration_id);
CREATE INDEX IF NOT EXISTS billing_event_existing_event_id ON billing_event(existing_event_id);

SELECT diesel_manage_updated_at('billing_event');