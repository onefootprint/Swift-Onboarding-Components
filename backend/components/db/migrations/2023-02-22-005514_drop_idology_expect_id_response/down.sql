-- this will re-create the table but will not re-populate the dropped data
CREATE TABLE idology_expect_id_response (
    id TEXT PRIMARY KEY DEFAULT prefixed_uid('ieir_'),
    verification_result_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_number BIGINT,
    id_scan TEXT,
    error TEXT,
    results TEXT,
    summary_result TEXT,
    qualifiers TEXT[] NOT NULL,
    
    CONSTRAINT fk_idology_expect_id_response_verification_result_id_id 
        FOREIGN KEY(verification_result_id) 
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idology_expect_id_response_verification_result_id ON idology_expect_id_response(verification_result_id);

SELECT diesel_manage_updated_at('idology_expect_id_response');
