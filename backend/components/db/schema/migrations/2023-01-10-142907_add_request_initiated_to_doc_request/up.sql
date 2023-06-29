ALTER TABLE document_request ADD COLUMN idv_reqs_initiated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE document_request ALTER COLUMN idv_reqs_initiated DROP DEFAULT;