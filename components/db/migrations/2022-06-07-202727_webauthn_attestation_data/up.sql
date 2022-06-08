
CREATE TYPE attestation_type as ENUM ('None', 'Unknown', 'Apple', 'AndroidKey', 'AndroidSafetyNet');

ALTER TABLE webauthn_credentials
ADD COLUMN backup_eligible boolean not null default False,
ADD COLUMN attestation_type attestation_type not null DEFAULT 'Unknown',
ADD COLUMN insight_event_id uuid,
ADD CONSTRAINT fk_insight_event
    FOREIGN KEY(insight_event_id)
    REFERENCES insight_events(id);
    