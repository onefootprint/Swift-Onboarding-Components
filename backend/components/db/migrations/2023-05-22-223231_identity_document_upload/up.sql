CREATE TABLE document_upload (
    id TEXT NOT NULL PRIMARY KEY DEFAULT prefixed_uid('idu_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    document_id TEXT NOT NULL,
    side TEXT NOT NULL,
    s3_url TEXT NOT NULL,
    e_data_key BYTEA NOT NULL,
    created_at timestamptz NOT NULL,
    deactivated_at timestamptz,
    CONSTRAINT fk_document_upload_document_id
        FOREIGN KEY(document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS document_upload_document_id ON document_upload(document_id);
-- Only allow one active upload for each side
CREATE UNIQUE INDEX IF NOT EXISTS document_upload_document_id_side ON document_upload(document_id, side) WHERE deactivated_at IS NULL;

SELECT diesel_manage_updated_at('document_upload');

-- backfill existing data
INSERT INTO document_upload(document_id, side, s3_url, e_data_key, created_at)
SELECT id, 'front', doc.front_image_s3_url, doc.e_data_key, current_timestamp
FROM identity_document doc
    WHERE doc.front_image_s3_url IS NOT NULL;

INSERT INTO document_upload(document_id, side, s3_url, e_data_key, created_at)
SELECT id, 'back', doc.back_image_s3_url, doc.e_data_key, current_timestamp
FROM identity_document doc
    WHERE doc.back_image_s3_url IS NOT NULL;

INSERT INTO document_upload(document_id, side, s3_url, e_data_key, created_at)
SELECT id, 'selfie', doc.selfie_image_s3_url, doc.e_data_key, current_timestamp
FROM identity_document doc
    WHERE doc.selfie_image_s3_url IS NOT NULL;


-- Remove old s3 urls on id doc table
ALTER TABLE identity_document
    DROP COLUMN front_image_s3_url,
    DROP COLUMN back_image_s3_url,
    DROP COLUMN selfie_image_s3_url,
    DROP COLUMN e_data_key;