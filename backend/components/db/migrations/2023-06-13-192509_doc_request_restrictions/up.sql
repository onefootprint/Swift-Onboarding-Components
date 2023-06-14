ALTER TABLE document_request
    ADD COLUMN only_us BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN doc_type_restriction TEXT[];

ALTER TABLE document_request ALTER COLUMN only_us DROP DEFAULT;

-- TODO backfill flexcar document requests