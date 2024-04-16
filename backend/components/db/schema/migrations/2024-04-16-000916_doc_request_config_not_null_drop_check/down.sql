ALTER TABLE document_request
    ADD CONSTRAINT config_not_null CHECK(config IS NOT NULL) NOT VALID;