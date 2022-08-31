ALTER TABLE verification_request
    DROP COLUMN email_id,
    DROP COLUMN phone_number_id,
    DROP COLUMN identity_data_id;

-- Junction table to attach multiple user_data rows to one verification_request
CREATE TABLE verification_request_user_data (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_data_id text NOT NULL,
    request_id uuid NOT NULL,
    CONSTRAINT fk_verification_request_user_data_request_id
        FOREIGN KEY(request_id) 
        REFERENCES verification_request(id)
);
 
CREATE INDEX IF NOT EXISTS fk_verification_request_user_data_request_id ON verification_request_user_data(request_id);