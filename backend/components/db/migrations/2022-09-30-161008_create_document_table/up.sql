CREATE TABLE identity_document (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('iddoc_'),
    request_id TEXT NOT NULL,
    user_vault_id TEXT NOT NULL,
    front_image_s3_url TEXT,
    back_image_s3_url TEXT,
    document_type TEXT NOT NULL,
    country_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_identity_document_request_id
        FOREIGN KEY(request_id) 
        REFERENCES document_request(id)
);

CREATE INDEX IF NOT EXISTS identity_document_request_id ON identity_document(request_id);

SELECT diesel_manage_updated_at('identity_document');