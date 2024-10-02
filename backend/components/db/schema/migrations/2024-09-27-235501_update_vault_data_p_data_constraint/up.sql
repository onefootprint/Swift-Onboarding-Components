/*
-- For future reference, the following needs to be run separately against the database.
ALTER TABLE vault_data DROP CONSTRAINT plaintext_data;
ALTER TABLE vault_data ADD CONSTRAINT plaintext_data CHECK ((p_data IS NULL) OR (kind = 'business.name') OR (kind ilike 'card.%.issuer') OR (kind ilike 'card.%.fingerprint') OR (kind ilike 'bank.%.fingerprint')) NOT VALID;
ALTER TABLE vault_data VALIDATE CONSTRAINT plaintext_data;
*/
ALTER TABLE vault_data DROP CONSTRAINT plaintext_data;
ALTER TABLE vault_data ADD CONSTRAINT plaintext_data CHECK ((p_data IS NULL) OR (kind = 'business.name') OR (kind ilike 'card.%.issuer') OR (kind ilike 'card.%.fingerprint') OR (kind ilike 'bank.%.fingerprint'));