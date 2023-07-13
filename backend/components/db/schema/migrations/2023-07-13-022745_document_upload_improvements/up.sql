ALTER TABLE document_upload
    ADD COLUMN created_seqno BIGINT,
    ADD COLUMN failure_reasons TEXT[];