ALTER TABLE verification_request
    ADD COLUMN onboarding_id UUID,
    ADD CONSTRAINT fk_verification_request_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboarding(id);

-- Right now, just take any onboarding for the scoped_user
UPDATE verification_request
    SET onboarding_id = onboarding.id
    FROM onboarding
    WHERE onboarding.scoped_user_id = verification_request.scoped_user_id;

ALTER TABLE verification_request
    ALTER COLUMN onboarding_id SET NOT NULL,
    DROP COLUMN scoped_user_id;

CREATE INDEX IF NOT EXISTS verification_request_onboarding_id ON verification_request(onboarding_id);