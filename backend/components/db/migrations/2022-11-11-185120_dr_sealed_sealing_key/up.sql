TRUNCATE document_request CASCADE;
ALTER TABLE document_request ADD COLUMN e_data_key bytea NOT NULL;
