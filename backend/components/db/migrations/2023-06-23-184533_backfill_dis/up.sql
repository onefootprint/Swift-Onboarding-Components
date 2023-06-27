UPDATE data_lifetime
SET kind = CASE
    WHEN kind = 'document.passport' THEN 'document.passport.front.image'
    WHEN kind = 'document.passport.selfie' THEN 'document.passport.selfie.image'
    WHEN kind = 'document.drivers_license.front' THEN 'document.drivers_license.front.image'
    WHEN kind = 'document.drivers_license.back' THEN 'document.drivers_license.back.image'
    WHEN kind = 'document.drivers_license.selfie' THEN 'document.drivers_license.selfie.image'
    WHEN kind = 'document.id_card.front' THEN 'document.id_card.front.image'
    WHEN kind = 'document.id_card.back' THEN 'document.id_card.back.image'
    WHEN kind = 'document.id_card.selfie' THEN 'document.id_card.selfie.image'
    ELSE kind
END;

UPDATE document_data
SET kind = CASE
    WHEN kind = 'passport' THEN 'passport.front.image'
    WHEN kind = 'passport.selfie' THEN 'passport.selfie.image'
    WHEN kind = 'drivers_license.front' THEN 'drivers_license.front.image'
    WHEN kind = 'drivers_license.back' THEN 'drivers_license.back.image'
    WHEN kind = 'drivers_license.selfie' THEN 'drivers_license.selfie.image'
    WHEN kind = 'id_card.front' THEN 'id_card.front.image'
    WHEN kind = 'id_card.back' THEN 'id_card.back.image'
    WHEN kind = 'id_card.selfie' THEN 'id_card.selfie.image'
    ELSE kind
END;

UPDATE access_event
SET targets = (
    SELECT array_agg(CASE
        WHEN target = 'document.passport' THEN 'document.passport.front.image'
        WHEN target = 'document.passport.selfie' THEN 'document.passport.selfie.image'
        WHEN target = 'document.drivers_license.front' THEN 'document.drivers_license.front.image'
        WHEN target = 'document.drivers_license.back' THEN 'document.drivers_license.back.image'
        WHEN target = 'document.drivers_license.selfie' THEN 'document.drivers_license.selfie.image'
        WHEN target = 'document.id_card.front' THEN 'document.id_card.front.image'
        WHEN target = 'document.id_card.back' THEN 'document.id_card.back.image'
        WHEN target = 'document.id_card.selfie' THEN 'document.id_card.selfie.image'
        ELSE target
    END)
    FROM unnest(targets) as target
)
WHERE
    (SELECT TRUE FROM UNNEST(targets) AS target WHERE target ilike 'document.%' LIMIT 1);