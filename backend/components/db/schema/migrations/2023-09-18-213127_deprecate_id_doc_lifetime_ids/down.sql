ALTER TABLE identity_document
    ADD COLUMN front_lifetime_id TEXT,
    ADD COLUMN back_lifetime_id TEXT,
    ADD COLUMN selfie_lifetime_id TEXT;