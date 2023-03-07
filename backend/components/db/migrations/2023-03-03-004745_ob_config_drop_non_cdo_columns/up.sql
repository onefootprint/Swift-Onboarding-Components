ALTER TABLE ob_configuration
    DROP COLUMN must_collect_identity_document,
    DROP COLUMN must_collect_selfie,
    DROP COLUMN can_access_identity_document_images,
    DROP COLUMN can_access_selfie_image;