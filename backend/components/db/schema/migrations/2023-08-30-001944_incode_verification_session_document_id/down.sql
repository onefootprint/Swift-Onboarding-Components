ALTER TABLE incode_verification_session DROP CONSTRAINT fk_incode_verification_session_identity_document_id;
ALTER TABLE incode_verification_session_event DROP CONSTRAINT fk_incode_verification_session_event_identity_document_id;


ALTER TABLE incode_verification_session
    ADD CONSTRAINT fk_identity_document_id
        FOREIGN KEY(identity_document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE incode_verification_session_event
    ADD CONSTRAINT fk_identity_document_id
        FOREIGN KEY(identity_document_id) 
        REFERENCES identity_document(id)
        DEFERRABLE INITIALLY DEFERRED;