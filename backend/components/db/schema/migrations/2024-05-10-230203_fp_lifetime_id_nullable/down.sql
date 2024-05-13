UPDATE fingerprint SET lifetime_id = fingerprint_junction.lifetime_id FROM fingerprint_junction WHERE fingerprint_id = fingerprint.id;

ALTER TABLE fingerprint ALTER COLUMN lifetime_id SET NOT NULL;