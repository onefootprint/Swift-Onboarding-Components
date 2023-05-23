ALTER TABLE identity_document
    ADD COLUMN front_image_s3_url TEXT,
    ADD COLUMN back_image_s3_url TEXT,
    ADD COLUMN selfie_image_s3_url TEXT,
    ADD COLUMN e_data_key BYTEA; -- todo should be not null but can't bc of triggers......

UPDATE identity_document
SET back_image_s3_url = s3_url, e_data_key = document_upload.e_data_key
FROM document_upload
WHERE document_id = identity_document.id
    AND side = 'front';

UPDATE identity_document
SET back_image_s3_url = s3_url
FROM document_upload
WHERE document_id = identity_document.id
    AND side = 'back';

UPDATE identity_document
SET selfie_image_s3_url = s3_url
FROM document_upload
WHERE document_id = identity_document.id
    AND side = 'selfie';

DROP TABLE document_upload;