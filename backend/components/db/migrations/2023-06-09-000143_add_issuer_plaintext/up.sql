ALTER TABLE vault_data DROP CONSTRAINT plaintext_data;
ALTER TABLE vault_data ADD CONSTRAINT plaintext_data CHECK ((p_data IS NULL) OR (kind = 'business.name') OR (kind ilike 'card.%.issuer'));