ALTER TABLE identity_document ADD COLUMN selfie_image_s3_url TEXT;
ALTER TABLE document_request ADD COLUMN should_collect_selfie BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE document_request ALTER COLUMN should_collect_selfie DROP DEFAULT;
