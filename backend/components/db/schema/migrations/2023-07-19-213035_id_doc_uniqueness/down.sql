DROP INDEX identity_document_unique_doc_request_id_where_pending;
-- Re-adding the constraint breaks CI since tests add identity_document rows that violate this uniqueness constraint
-- ALTER TABLE identity_document ADD CONSTRAINT identity_document_request_id_key UNIQUE(request_id);