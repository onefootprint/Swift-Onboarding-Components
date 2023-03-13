ALTER TABLE verification_request 
    ADD COLUMN scoped_user_id TEXT,
    ADD CONSTRAINT fk_verification_request_scoped_user_id
        FOREIGN KEY(scoped_user_id)
        REFERENCES scoped_user(id)
        DEFERRABLE INITIALLY DEFERRED;