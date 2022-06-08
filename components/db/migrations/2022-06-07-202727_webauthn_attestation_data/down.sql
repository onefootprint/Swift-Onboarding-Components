
ALTER TABLE webauthn_credentials
DROP COLUMN attestation_type,
DROP COLUMN insight_event_id,
DROP COLUMN backup_eligible;

DROP TYPE attestation_type;
