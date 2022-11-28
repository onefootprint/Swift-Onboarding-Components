ALTER TABLE identity_document ADD COLUMN e_data_key BYTEA;

UPDATE identity_document 
    SET e_data_key = document_request.e_data_key
    FROM document_request
    WHERE document_request.id = identity_document.request_id;

ALTER TABLE identity_document ALTER COLUMN e_data_key SET NOT NULL;
ALTER TABLE document_request DROP COLUMN e_data_key;
