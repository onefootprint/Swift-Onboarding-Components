-- New DocumentKind values
UPDATE data_lifetime
SET kind = CASE
    WHEN kind = 'document.passport_selfie' THEN 'document.passport.selfie'
    WHEN kind = 'document.drivers_license_front' THEN 'document.drivers_license.front'
    WHEN kind = 'document.drivers_license_back' THEN 'document.drivers_license.back'
    WHEN kind = 'document.drivers_license_selfie' THEN 'document.drivers_license.selfie'
    WHEN kind = 'document.id_card_front' THEN 'document.id_card.front'
    WHEN kind = 'document.id_card_back' THEN 'document.id_card.back'
    WHEN kind = 'document.id_card_selfie' THEN 'document.id_card.selfie'
    ELSE kind
END;

UPDATE document_data
SET kind = CASE
    WHEN kind = 'passport_selfie' THEN 'passport.selfie'
    WHEN kind = 'drivers_license_front' THEN 'drivers_license.front'
    WHEN kind = 'drivers_license_back' THEN 'drivers_license.back'
    WHEN kind = 'drivers_license_selfie' THEN 'drivers_license.selfie'
    WHEN kind = 'id_card_front' THEN 'id_card.front'
    WHEN kind = 'id_card_back' THEN 'id_card.back'
    WHEN kind = 'id_card_selfie' THEN 'id_card.selfie'
    ELSE kind
END;

-- New CardDataKind values

UPDATE data_lifetime
SET kind = REPLACE(kind, '.exp_month', '.expiration.month')
WHERE kind like 'card.%.exp_month';

UPDATE data_lifetime
SET kind = REPLACE(kind, '.exp_year', '.expiration.year')
WHERE kind like 'card.%.exp_year';

UPDATE data_lifetime
SET kind = REPLACE(kind, '.last4', '.number.last4')
WHERE kind like 'card.%.last4' and kind not ilike 'card.%.number.last4'; -- since the legacy suffix is the suffix of the new suffix :')


UPDATE vault_data
SET kind = REPLACE(kind, '.exp_month', '.expiration.month')
WHERE kind like 'card.%.exp_month';

UPDATE vault_data
SET kind = REPLACE(kind, '.exp_year', '.expiration.year')
WHERE kind like 'card.%.exp_year';

UPDATE vault_data
SET kind = REPLACE(kind, '.last4', '.number.last4')
WHERE kind like 'card.%.last4' and kind not ilike 'card.%.number.last4';