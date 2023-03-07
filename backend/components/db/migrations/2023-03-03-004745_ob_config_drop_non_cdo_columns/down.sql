ALTER TABLE ob_configuration
    ADD COLUMN must_collect_identity_document BOOLEAN,
    ADD COLUMN must_collect_selfie BOOLEAN,
    ADD COLUMN can_access_identity_document_images BOOLEAN,
    ADD COLUMN can_access_selfie_image BOOLEAN;

UPDATE ob_configuration
SET
    must_collect_identity_document = CASE 
        WHEN 'document_and_selfie' = ANY(must_collect_data) THEN true
        WHEN 'document' = ANY(must_collect_data) THEN true
        ELSE false
    END,
    must_collect_selfie = CASE 
        WHEN 'document_and_selfie' = ANY(must_collect_data) THEN true
        ELSE false
    END,
    can_access_identity_document_images = CASE 
        WHEN 'document_and_selfie' = ANY(can_access_data) THEN true
        WHEN 'document' = ANY(can_access_data) THEN true
        ELSE false
    END,
    can_access_selfie_image = CASE 
        WHEN 'document_and_selfie'= ANY(can_access_data) THEN true
        ELSE false
    END;

ALTER TABLE ob_configuration
    ALTER COLUMN must_collect_identity_document SET NOT NULL,
    ALTER COLUMN must_collect_selfie SET NOT NULL,
    ALTER COLUMN can_access_identity_document_images SET NOT NULL,
    ALTER COLUMN can_access_selfie_image SET NOT NULL;