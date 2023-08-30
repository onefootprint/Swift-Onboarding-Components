DROP TABLE auth_event;

ALTER TABLE apple_device_attestation
    DROP COLUMN bundle_id,
    DROP COLUMN webauthn_credential_id,
    ADD COLUMN webauthn_cred_public_key bytea;