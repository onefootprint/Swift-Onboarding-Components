ALTER TABLE document_request DROP COLUMN idv_reqs_initiated;

-- Unrelated, just needs to happen
ALTER TABLE identity_document ADD UNIQUE (request_id);