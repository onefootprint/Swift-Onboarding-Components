ALTER TABLE ob_configuration ADD COLUMN must_collect_selfie BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE ob_configuration ADD COLUMN can_access_selfie_image BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE ob_configuration ALTER COLUMN must_collect_selfie DROP DEFAULT;
ALTER TABLE ob_configuration ALTER COLUMN can_access_selfie_image DROP DEFAULT;