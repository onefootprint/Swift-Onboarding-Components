ALTER TABLE risk_signal
    ADD COLUMN verification_result_id TEXT,
    ADD CONSTRAINT fk_risk_signal_verification_result_id
        FOREIGN KEY(verification_result_id)
        REFERENCES verification_result(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX risk_signal_verification_result_id ON risk_signal(verification_result_id);

ALTER TABLE risk_signal ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE risk_signal ALTER COLUMN hidden DROP DEFAULT;
