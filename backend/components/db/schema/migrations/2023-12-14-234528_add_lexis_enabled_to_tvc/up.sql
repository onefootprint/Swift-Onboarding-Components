ALTER TABLE tenant_vendor_control ADD COLUMN lexis_enabled BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE tenant_vendor_control ALTER COLUMN lexis_enabled DROP DEFAULT;