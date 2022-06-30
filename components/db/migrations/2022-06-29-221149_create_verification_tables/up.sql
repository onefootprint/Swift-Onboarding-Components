CREATE TABLE verification_requests (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    onboarding_id varchar(250) NOT NULL,
    vendor text NOT NULL,
    timestamp timestamp NOT NULL,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_verification_requests_onboarding_id
        FOREIGN KEY(onboarding_id) 
        REFERENCES onboardings(id)
);

CREATE INDEX IF NOT EXISTS verification_requests_onboarding_id ON verification_requests(onboarding_id);

SELECT diesel_manage_updated_at('verification_requests');

-- Junction table to attach multiple user_data rows to one verification_request
CREATE TABLE verification_requests_user_data (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_data_id text NOT NULL,
    request_id uuid NOT NULL,
    CONSTRAINT fk_verification_requests_user_data_user_data_id
        FOREIGN KEY(user_data_id) 
        REFERENCES user_data(id),
    CONSTRAINT fk_verification_requests_user_data_request_id
        FOREIGN KEY(request_id) 
        REFERENCES verification_requests(id)
);
 
CREATE INDEX IF NOT EXISTS fk_verification_requests_user_data_user_data_id ON verification_requests_user_data(user_data_id);
CREATE INDEX IF NOT EXISTS fk_verification_requests_user_data_request_id ON verification_requests_user_data(request_id);

CREATE TABLE verification_results (
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id uuid NOT NULL,
    response jsonb NOT NULL,
    timestamp timestamp NOT NULL,
    _created_at timestamp NOT NULL DEFAULT NOW(),
    _updated_at timestamp NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_verification_results_request_id
        FOREIGN KEY(request_id) 
        REFERENCES verification_requests(id)
);

CREATE INDEX IF NOT EXISTS verification_results_request_id ON verification_results(request_id);
 
SELECT diesel_manage_updated_at('verification_results');