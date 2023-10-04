ALTER TABLE incode_verification_session
    ADD COLUMN deactivated_at TIMESTAMPTZ;

-- Normally must be concurrently, but these tables are small
DROP INDEX incode_verification_session_unique_identity_document_id;
CREATE UNIQUE INDEX incode_verification_session_unique_identity_document_id ON incode_verification_session(identity_document_id) WHERE deactivated_at IS NULL;
