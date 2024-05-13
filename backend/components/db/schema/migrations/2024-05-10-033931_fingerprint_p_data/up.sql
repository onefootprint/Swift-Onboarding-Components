ALTER TABLE fingerprint ADD COLUMN p_data TEXT;

ALTER TABLE fingerprint ALTER COLUMN sh_data DROP NOT NULL;

ALTER TABLE fingerprint
    ADD CONSTRAINT only_sh_data_or_p_data CHECK((p_data IS NULL) != (sh_data IS NULL)) NOT VALID;