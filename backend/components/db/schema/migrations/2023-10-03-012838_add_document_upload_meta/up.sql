ALTER TABLE document_upload
    ADD COLUMN is_instant_app BOOLEAN,
    ADD COLUMN is_app_clip BOOLEAN,
    ADD COLUMN is_manual BOOLEAN;