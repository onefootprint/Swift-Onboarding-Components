UPDATE document_request
SET status = identity_document.status
FROM identity_document
WHERE document_request.id = identity_document.request_id;

UPDATE document_request
SET status = 'pending'
WHERE status IS NULL;

ALTER TABLE document_request ALTER COLUMN status SET NOT NULL;

ALTER TABLE identity_document DROP COLUMN status;