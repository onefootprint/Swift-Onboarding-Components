CREATE TABLE google_device_attestation (
    id text PRIMARY KEY DEFAULT prefixed_uid('goog_att_'),
    vault_id text NOT NULL,
    metadata JSONB NOT NULL,
    created_at timestamptz NOT NULL,

    raw_token TEXT NOT NULL,
    raw_claims JSONB NOT NULL,

    package_name TEXT NOT NULL,
    app_version TEXT,

    webauthn_credential_id TEXT,

    widevine_id TEXT,
    widevine_security_level TEXT,
    android_id TEXT,

    is_trustworthy_device BOOLEAN NOT NULL,
    is_evaluated_device BOOLEAN NOT NULL,

    license_verdict TEXT NOT NULL,
    recognition_verdict TEXT NOT NULL,
    integrity_level TEXT NOT NULL,
  
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vault_id_google_device_attestation
        FOREIGN KEY(vault_id)
        REFERENCES vault(id)
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_webauthn_credential_id_google_device_attestation
        FOREIGN KEY(webauthn_credential_id)
        REFERENCES webauthn_credential(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS google_device_attest_vault_id ON google_device_attestation(vault_id);
CREATE INDEX IF NOT EXISTS google_device_webauthn_credential_id ON google_device_attestation(webauthn_credential_id);
CREATE INDEX IF NOT EXISTS google_device_widevine_id ON google_device_attestation(widevine_id);
CREATE INDEX IF NOT EXISTS google_device_android_id ON google_device_attestation(android_id);


SELECT diesel_manage_updated_at('google_device_attestation');