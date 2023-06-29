ALTER TABLE document_request ADD COLUMN idv_reqs_initiated BOOLEAN DEFAULT FALSE;
ALTER TABLE document_request ALTER COLUMN idv_reqs_initiated DROP DEFAULT;

ALTER TABLE identity_document DROP CONSTRAINT identity_document_request_id_key;