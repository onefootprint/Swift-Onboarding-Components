ALTER TABLE verification_request
    ADD COLUMN scoped_user_id text,
    ADD CONSTRAINT fk_verification_request_scoped_user_id
        FOREIGN KEY(scoped_user_id) 
        REFERENCES scoped_user(id);

UPDATE verification_request
    SET scoped_user_id = onboarding.scoped_user_id
    FROM onboarding
    WHERE onboarding.id = verification_request.onboarding_id;

ALTER TABLE verification_request
    ALTER COLUMN scoped_user_id SET NOT NULL,
    DROP COLUMN onboarding_id;

CREATE INDEX IF NOT EXISTS verification_request_scoped_user_id ON verification_request(scoped_user_id);