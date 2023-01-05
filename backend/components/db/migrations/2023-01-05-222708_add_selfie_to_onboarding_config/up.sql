ALTER TABLE ob_configuration ADD COLUMN must_collect_selfie BOOLEAN;
ALTER TABLE ob_configuration ADD COLUMN can_access_selfie_image BOOLEAN;

UPDATE ob_configuration SET must_collect_selfie = false;
UPDATE ob_configuration SET can_access_selfie_image = false;
COMMIT;

ALTER TABLE ob_configuration ALTER COLUMN must_collect_selfie SET NOT NULL;
ALTER TABLE ob_configuration ALTER COLUMN can_access_selfie_image SET NOT NULL;