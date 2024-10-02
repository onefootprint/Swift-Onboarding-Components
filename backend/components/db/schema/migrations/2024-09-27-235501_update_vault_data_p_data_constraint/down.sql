DELETE FROM fingerprint_junction 
USING fingerprint
WHERE fingerprint.id = fingerprint_junction.fingerprint_id AND fingerprint.kind ilike 'card.%.fingerprint';

DELETE FROM fingerprint WHERE kind ilike 'card.%.fingerprint';
DELETE FROM vault_data WHERE kind ilike 'card.%.fingerprint';
DELETE FROM data_lifetime WHERE kind ilike 'card.%.fingerprint';
DELETE FROM vault_data WHERE kind ilike 'card.%.fingerprint';

DELETE FROM fingerprint_junction 
USING fingerprint
WHERE fingerprint.id = fingerprint_junction.fingerprint_id AND fingerprint.kind ilike 'bank.%.fingerprint';

DELETE FROM fingerprint WHERE kind ilike 'bank.%.fingerprint';
DELETE FROM vault_data WHERE kind ilike 'bank.%.fingerprint';
DELETE FROM data_lifetime WHERE kind ilike 'bank.%.fingerprint';
DELETE FROM vault_data WHERE kind ilike 'bank.%.fingerprint';

ALTER TABLE vault_data DROP CONSTRAINT plaintext_data;
ALTER TABLE vault_data ADD CONSTRAINT plaintext_data CHECK ((p_data IS NULL) OR (kind = 'business.name') OR (kind ilike 'card.%.issuer'));