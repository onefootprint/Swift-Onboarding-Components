UPDATE webauthn_credentials SET attestation_type = 'Unknown' where attestation_type = 'AppleApp';

ALTER TYPE attestation_type RENAME to _attestation_type;
CREATE TYPE attestation_type as ENUM ('None', 'Unknown', 'Apple', 'AndroidKey', 'AndroidSafetyNet');

ALTER TABLE webauthn_credentials
  ALTER COLUMN attestation_type DROP DEFAULT,
  ALTER COLUMN attestation_type type attestation_type using attestation_type::text::attestation_type,
  ALTER COLUMN attestation_type SET DEFAULT 'Unknown';

DROP TYPE _attestation_type;