ALTER TABLE verification_request
    ADD COLUMN decision_intent_id TEXT,
    ADD CONSTRAINT fk_verification_request_decision_intent_id
        FOREIGN KEY(decision_intent_id) 
        REFERENCES decision_intent(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS verification_request_decision_intent_id ON verification_request(decision_intent_id);
