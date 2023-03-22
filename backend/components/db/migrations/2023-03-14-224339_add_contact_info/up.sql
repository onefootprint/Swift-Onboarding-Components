CREATE TABLE contact_info (
    id text PRIMARY KEY DEFAULT prefixed_uid('ci_'),
    is_verified  BOOLEAN NOT NULL,
    priority TEXT NOT NULL,
    lifetime_id TEXT NOT NULL,
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_contact_info_lifetime_id
        FOREIGN KEY(lifetime_id)
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS contact_info_lifetime_id ON contact_info(lifetime_id);

SELECT diesel_manage_updated_at('contact_info');
