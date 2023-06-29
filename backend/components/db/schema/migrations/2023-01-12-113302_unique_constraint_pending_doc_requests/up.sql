-- we only want one pending doc request per scoped user
ALTER TABLE document_request ADD COLUMN previous_document_request_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS document_request_pending_scoped_user_unique_idx ON document_request(scoped_user_id) WHERE status = 'pending';
