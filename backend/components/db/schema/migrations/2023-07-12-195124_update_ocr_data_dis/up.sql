UPDATE vault_data
SET kind = CASE
    WHEN kind = 'document.passport.number' THEN 'document.passport.document_number'
    WHEN kind = 'document.id_card.number' THEN 'document.id_card.document_number'
    WHEN kind = 'document.drivers_license.number' THEN 'document.drivers_license.document_number'
    WHEN kind = 'document.passport.expiration' THEN 'document.passport.expires_at'
    WHEN kind = 'document.id_card.expiration' THEN 'document.id_card.expires_at'
    WHEN kind = 'document.drivers_license.expiration' THEN 'document.drivers_license.expires_at'
    ELSE kind
END
WHERE kind IN (
    'document.passport.number', 'document.id_card.number', 'document.drivers_license.number',
    'document.passport.expiration', 'document.id_card.expiration', 'document.drivers_license.expiration'
);

UPDATE data_lifetime
SET kind = CASE
    WHEN kind = 'document.passport.number' THEN 'document.passport.document_number'
    WHEN kind = 'document.id_card.number' THEN 'document.id_card.document_number'
    WHEN kind = 'document.drivers_license.number' THEN 'document.drivers_license.document_number'
    WHEN kind = 'document.passport.expiration' THEN 'document.passport.expires_at'
    WHEN kind = 'document.id_card.expiration' THEN 'document.id_card.expires_at'
    WHEN kind = 'document.drivers_license.expiration' THEN 'document.drivers_license.expires_at'
    ELSE kind
END
WHERE kind IN (
    'document.passport.number', 'document.id_card.number', 'document.drivers_license.number',
    'document.passport.expiration', 'document.id_card.expiration', 'document.drivers_license.expiration'
);

UPDATE access_event
SET targets = (
    SELECT array_agg(CASE
        WHEN target = 'document.passport.number' THEN 'document.passport.document_number'
        WHEN target = 'document.id_card.number' THEN 'document.id_card.document_number'
        WHEN target = 'document.drivers_license.number' THEN 'document.drivers_license.document_number'
        WHEN target = 'document.passport.expiration' THEN 'document.passport.expires_at'
        WHEN target = 'document.id_card.expiration' THEN 'document.id_card.expires_at'
        WHEN target = 'document.drivers_license.expiration' THEN 'document.drivers_license.expires_at'
        ELSE target
    END)
    FROM unnest(targets) as target
)
WHERE
    (SELECT TRUE FROM UNNEST(targets) AS target WHERE target ilike 'document.%.number' OR target ilike 'document.%.expiration' LIMIT 1);