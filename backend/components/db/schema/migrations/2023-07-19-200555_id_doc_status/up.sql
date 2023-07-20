ALTER TABLE identity_document ADD COLUMN status TEXT;

UPDATE identity_document
SET status = document_request.status
FROM document_request
WHERE document_request.id = identity_document.request_id;

ALTER TABLE identity_document ALTER COLUMN status SET NOT NULL;

ALTER TABLE document_request ALTER COLUMN status DROP NOT NULL;