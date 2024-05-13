CREATE TABLE fingerprint_junction (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('fpj_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    fingerprint_id TEXT NOT NULL,
    lifetime_id TEXT NOT NULL,
    CONSTRAINT fk_fingerprint_junction_fingerprint_id
        FOREIGN KEY(fingerprint_id) 
        REFERENCES fingerprint(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_fingerprint_junction_lifetime_id
        FOREIGN KEY(lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

SELECT diesel_manage_updated_at('fingerprint_junction');

CREATE INDEX fingerprint_junction_fingerprint_id ON fingerprint_junction(fingerprint_id);
-- Can omit index on lifetime_id since it's a prefix of this index
CREATE INDEX fingerprint_junction_idx ON fingerprint_junction(lifetime_id, fingerprint_id);