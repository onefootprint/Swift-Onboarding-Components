-- TODO drop default
ALTER TABLE document_upload ADD COLUMN is_extra_compressed BOOLEAN NOT NULL DEFAULT 'f';