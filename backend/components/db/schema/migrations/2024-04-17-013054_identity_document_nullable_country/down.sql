UPDATE identity_document SET country_code = 'US' WHERE country_code IS NULL;
ALTER TABLE identity_document ALTER COLUMN country_code SET NOT NULL;