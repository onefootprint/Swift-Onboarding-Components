ALTER TABLE verification_request
    ADD COLUMN email_id TEXT,
    ADD COLUMN phone_number_id TEXT,
    ADD COLUMN identity_data_id TEXT,
    ADD CONSTRAINT fk_verification_request_email_id
        FOREIGN KEY(email_id) 
        REFERENCES email(id),
    ADD CONSTRAINT fk_verification_request_phone_number_id
        FOREIGN KEY(phone_number_id) 
        REFERENCES phone_number(id),
    ADD CONSTRAINT fk_verification_request_identity_data_id
        FOREIGN KEY(identity_data_id) 
        REFERENCES identity_data(id);

CREATE INDEX IF NOT EXISTS verification_request_email_id ON verification_request(email_id);
CREATE INDEX IF NOT EXISTS verification_request_phone_number_id ON verification_request(phone_number_id);
CREATE INDEX IF NOT EXISTS verification_request_identity_data_id ON verification_request(identity_data_id);

DROP TABLE verification_request_user_data;