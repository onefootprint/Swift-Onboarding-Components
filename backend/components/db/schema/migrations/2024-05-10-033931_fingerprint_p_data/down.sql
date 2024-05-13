ALTER TABLE fingerprint DROP COLUMN p_data;

ALTER TABLE fingerprint ALTER COLUMN sh_data SET NOT NULL;