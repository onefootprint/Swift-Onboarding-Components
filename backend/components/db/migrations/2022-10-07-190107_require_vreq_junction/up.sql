CREATE TABLE requirement_verification_request_junction(
    id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_request_id uuid NOT NULL,
    requirement_id TEXT NOT NULL,

    CONSTRAINT fk_verification_request_id
        FOREIGN KEY(verification_request_id) 
        REFERENCES verification_request(id),

    CONSTRAINT fk_requirement_id
        FOREIGN KEY(requirement_id) 
        REFERENCES requirement(id)
);

CREATE INDEX IF NOT EXISTS junction_verification_request_id_index ON requirement_verification_request_junction(verification_request_id);
CREATE INDEX IF NOT EXISTS junction_requirement_id_index ON requirement_verification_request_junction(requirement_id);
