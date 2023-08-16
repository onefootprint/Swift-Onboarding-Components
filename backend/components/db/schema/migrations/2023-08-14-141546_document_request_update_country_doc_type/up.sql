ALTER TABLE document_request RENAME COLUMN doc_type_restriction TO global_doc_types_accepted;
ALTER TABLE document_request ADD COLUMN country_restrictions TEXT[];
ALTER TABLE document_request ADD COLUMN country_doc_type_restrictions JSONB;