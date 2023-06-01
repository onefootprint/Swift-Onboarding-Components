DROP INDEX incode_verification_session_unique_identity_document_id;
CREATE INDEX incode_verification_session_identity_document_id ON incode_verification_session(identity_document_id);

ALTER TABLE incode_verification_session
    ADD COLUMN scoped_vault_id TEXT,
    ADD CONSTRAINT fk_incode_verification_session_scoped_vault_id
        FOREIGN KEY(scoped_vault_id) 
        REFERENCES scoped_vault(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX incode_verification_session_scoped_vault_id ON incode_verification_session(scoped_vault_id);

-- Backfill scoped_vault_id

UPDATE incode_verification_session
SET scoped_vault_id = document_request.scoped_vault_id
FROM identity_document 
INNER JOIN document_request
    ON document_request.id = identity_document.request_id
WHERE identity_document.id = incode_verification_session.identity_document_id;

-- Grr triggers
COMMIT;
BEGIN;

ALTER TABLE incode_verification_session
    ALTER COLUMN scoped_vault_id SET NOT NULL;