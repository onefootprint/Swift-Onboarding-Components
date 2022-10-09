ALTER TABLE ob_configuration
    ADD COLUMN must_collect_identity_document BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN can_access_identity_document_images BOOLEAN NOT NULL DEFAULT FALSE;


ALTER TABLE ob_configuration
    ALTER COLUMN must_collect_identity_document DROP DEFAULT,
    ALTER COLUMN can_access_identity_document_images DROP DEFAULT;