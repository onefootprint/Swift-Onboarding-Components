ALTER TABLE ob_configuration
    ADD COLUMN is_doc_first BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE ob_configuration
    ALTER COLUMN is_doc_first DROP DEFAULT;