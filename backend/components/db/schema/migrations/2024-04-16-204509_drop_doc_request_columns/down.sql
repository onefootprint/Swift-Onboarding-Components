ALTER TABLE document_request ADD COLUMN ref_id TEXT;
ALTER TABLE document_request ADD COLUMN should_collect_selfie BOOL DEFAULT 'f';