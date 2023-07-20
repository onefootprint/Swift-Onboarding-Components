ALTER TABLE identity_document DROP CONSTRAINT identity_document_request_id_key;
CREATE UNIQUE INDEX identity_document_unique_doc_request_id_where_pending ON identity_document(request_id) WHERE status = 'pending';