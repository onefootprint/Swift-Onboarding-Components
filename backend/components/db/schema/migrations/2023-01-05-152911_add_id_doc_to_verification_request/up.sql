ALTER TABLE verification_request
  ADD COLUMN identity_document_id TEXT,
  ADD CONSTRAINT fk_verification_request_identity_document_id
    FOREIGN KEY(identity_document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS verification_request_identity_document_id ON verification_request(identity_document_id);