ALTER TABLE contact_info ADD COLUMN is_tenant_verified BOOLEAN NOT NULL DEFAULT 'f';
-- TODO rm default