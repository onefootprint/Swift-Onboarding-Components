ALTER TABLE identity_document 
    ADD COLUMN skip_selfie BOOLEAN DEFAULT false, 
    ADD COLUMN device_type TEXT;
