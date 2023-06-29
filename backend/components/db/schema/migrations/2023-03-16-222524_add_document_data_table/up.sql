CREATE TABLE document_data (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('doc_'),
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lifetime_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    filename TEXT NOT NULL,
    s3_url TEXT NOT NULL,
    e_data_key BYTEA NOT NULL,
    
    CONSTRAINT fk_document_data_lifetime_id
        FOREIGN KEY(lifetime_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS document_data_lifetime_id ON document_data(lifetime_id);
SELECT diesel_manage_updated_at('document_data');