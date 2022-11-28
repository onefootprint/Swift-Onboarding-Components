
ALTER TABLE document_request ADD COLUMN e_data_key BYTEA;

UPDATE document_request 
    SET e_data_key = identity_document.e_data_key
    FROM identity_document
    WHERE document_request.id = identity_document.request_id;

ALTER TABLE document_request ALTER COLUMN e_data_key SET NOT NULL;

ALTER TABLE identity_document DROP COLUMN e_data_key;
