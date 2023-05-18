ALTER TABLE identity_document
    ADD COLUMN front_image_s3_url TEXT,
    ADD COLUMN back_image_s3_url TEXT,
    ADD COLUMN selfie_image_s3_url TEXT;