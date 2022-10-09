ALTER TABLE verification_request
    DROP CONSTRAINT fk_identity_document_id,
    DROP COLUMN identity_document_id;
