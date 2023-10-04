ALTER TABLE incode_verification_session DROP COLUMN IF EXISTS deactivated_at;

-- Normally must be concurrently, but these tables are small
CREATE UNIQUE INDEX incode_verification_session_unique_identity_document_id ON incode_verification_session(identity_document_id);