ALTER TABLE ob_configuration ADD COLUMN allow_reonboard BOOLEAN NOT NULL DEFAULT 'f';
ALTER TABLE ob_configuration ALTER COLUMN allow_reonboard DROP DEFAULT;