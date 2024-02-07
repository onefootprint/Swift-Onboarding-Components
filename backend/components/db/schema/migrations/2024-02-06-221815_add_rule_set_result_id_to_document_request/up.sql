ALTER TABLE document_request
    ADD COLUMN rule_set_result_id TEXT,
    ADD CONSTRAINT fk_document_request_rule_set_result_id
        FOREIGN KEY(rule_set_result_id)
        REFERENCES rule_set_result(id)
        DEFERRABLE INITIALLY DEFERRED;