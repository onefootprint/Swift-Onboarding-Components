ALTER TABLE vault_data ADD COLUMN p_data TEXT;

ALTER TABLE vault_data ADD CONSTRAINT plaintext_data CHECK ((p_data IS NULL) OR (kind in ('business.name')));