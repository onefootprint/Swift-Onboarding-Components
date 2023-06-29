-- New DocumentKind values

UPDATE data_lifetime
SET kind = CASE
    WHEN kind = 'document.passport.selfie' THEN 'document.passport_selfie'
    WHEN kind = 'document.drivers_license.front' THEN 'document.drivers_license_front'
    WHEN kind = 'document.drivers_license.back' THEN 'document.drivers_license_back'
    WHEN kind = 'document.drivers_license.selfie' THEN 'document.drivers_license_selfie'
    WHEN kind = 'document.id_card.front' THEN 'document.id_card_front'
    WHEN kind = 'document.id_card.back' THEN 'document.id_card_back'
    WHEN kind = 'document.id_card.selfie' THEN 'document.id_card_selfie'
    ELSE kind
END;

UPDATE document_data
SET kind = CASE
    WHEN kind = 'document.passport.selfie' THEN 'document.passport_selfie'
    WHEN kind = 'document.drivers_license.front' THEN 'document.drivers_license_front'
    WHEN kind = 'document.drivers_license.back' THEN 'document.drivers_license_back'
    WHEN kind = 'document.drivers_license.selfie' THEN 'document.drivers_license_selfie'
    WHEN kind = 'document.id_card.front' THEN 'document.id_card_front'
    WHEN kind = 'document.id_card.back' THEN 'document.id_card_back'
    WHEN kind = 'document.id_card.selfie' THEN 'document.id_card_selfie'
    ELSE kind
END;

-- New CardDataKind values

UPDATE data_lifetime
SET kind = REPLACE(kind, '.expiration.month', '.exp_month')
WHERE kind like 'card.%.expiration.month';

UPDATE data_lifetime
SET kind = REPLACE(kind, '.expiration.year', '.exp_year')
WHERE kind like 'card.%.expiration.year';

UPDATE data_lifetime
SET kind = REPLACE(kind, '.number.last4', '.last4')
WHERE kind like 'card.%.number.last4';

UPDATE vault_data
SET kind = REPLACE(kind, '.expiration.month', '.exp_month')
WHERE kind like 'card.%.expiration.month';

UPDATE vault_data
SET kind = REPLACE(kind, '.expiration.year', '.exp_year')
WHERE kind like 'card.%.expiration.year';

UPDATE vault_data
SET kind = REPLACE(kind, '.number.last4', '.last4')
WHERE kind like 'card.%.number.last4';