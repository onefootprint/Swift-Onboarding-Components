CREATE TABLE apple_device_attestation (
    id text PRIMARY KEY DEFAULT prefixed_uid('appl_att_'),
    vault_id text NOT NULL,
    metadata JSONB NOT NULL,
    receipt BYTEA NOT NULL,
    raw_attestation BYTEA NOT NULL,

    webauthn_cred_public_key BYTEA,

    is_development BOOLEAN NOT NULL,
    attested_key_id BYTEA NOT NULL,
    attested_public_key BYTEA NOT NULL,

    receipt_type TEXT NOT NULL,
    receipt_risk_metric INTEGER,
    receipt_expiration timestamptz NOT NULL,
    receipt_creation timestamptz NOT NULL,
    receipt_not_before timestamptz,

    dc_token TEXT,
    dc_bit0 BOOLEAN,
    dc_bit1 BOOLEAN,
    dc_last_updated TEXT,
    
    created_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_attested_device_for_vault
        FOREIGN KEY(vault_id)
        REFERENCES vault(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS apple_device_attest_vault_id ON apple_device_attestation(vault_id);
CREATE INDEX IF NOT EXISTS apple_device_attest_key_id ON apple_device_attestation(attested_key_id);
CREATE INDEX IF NOT EXISTS apple_device_attest_public_key_id ON apple_device_attestation(attested_public_key);
CREATE INDEX IF NOT EXISTS apple_device_webauthn_public_key_id ON apple_device_attestation(webauthn_cred_public_key);
