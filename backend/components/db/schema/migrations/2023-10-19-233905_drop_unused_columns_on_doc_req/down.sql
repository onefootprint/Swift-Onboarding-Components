ALTER TABLE document_request ADD COLUMN global_doc_types_accepted TEXT[];
ALTER TABLE document_request ADD COLUMN country_restrictions TEXT[];
ALTER TABLE document_request ADD COLUMN country_doc_type_restrictions JSONB;