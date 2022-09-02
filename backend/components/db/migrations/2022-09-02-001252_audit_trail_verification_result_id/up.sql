ALTER TABLE audit_trail
    ADD COLUMN verification_result_id UUID,
    ADD CONSTRAINT fk_audit_trail_verifiction_result_id
        FOREIGN KEY(verification_result_id)
        REFERENCES verification_result(id);