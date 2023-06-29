DELETE FROM data_lifetime WHERE kind ilike 'card.%.issuer';
DELETE FROM vault_data WHERE kind ilike 'card.%.issuer';

ALTER TABLE vault_data DROP CONSTRAINT plaintext_data;
ALTER TABLE vault_data ADD CONSTRAINT plaintext_data CHECK ((p_data IS NULL) OR (kind in ('business.name')));