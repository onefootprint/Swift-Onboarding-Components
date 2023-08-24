ALTER TABLE ob_configuration
    ADD COLUMN allow_international_residents BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE ob_configuration
    ALTER COLUMN allow_international_residents DROP DEFAULT;

ALTER TABLE ob_configuration
    ADD COLUMN international_country_restrictions TEXT[];