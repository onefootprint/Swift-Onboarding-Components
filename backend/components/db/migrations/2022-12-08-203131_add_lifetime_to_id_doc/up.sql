-- too hard to synthetically add non-null lifetime ids, so :wave:
DROP TABLE IF EXISTS identity_document;
--
-- identity_document
--

CREATE TABLE identity_document (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('iddoc_'),
    request_id TEXT NOT NULL,
    front_image_s3_url TEXT,
    back_image_s3_url TEXT,
    document_type TEXT NOT NULL,
    country_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    e_data_key BYTEA NOT NULL,
    -- only new thing from 2022-12-07-130720_create_tables
    lifetime_id TEXT NOT NULL,
    CONSTRAINT fk_identity_document_request_id
        FOREIGN KEY(request_id) 
        REFERENCES document_request(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_identity_document_lifetime_id
        FOREIGN KEY(lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS identity_document_request_id ON identity_document(request_id);
CREATE INDEX IF NOT EXISTS identity_document_lifetime_id ON identity_document(lifetime_id);

SELECT diesel_manage_updated_at('identity_document');