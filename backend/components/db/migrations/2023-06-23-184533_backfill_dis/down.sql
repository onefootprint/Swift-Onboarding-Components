UPDATE data_lifetime
SET kind = CASE
    WHEN kind = 'document.passport.front.image' THEN 'document.passport'
    WHEN kind = 'document.passport.selfie.image' THEN 'document.passport.selfie'
    WHEN kind = 'document.drivers_license.front.image' THEN 'document.drivers_license.front'
    WHEN kind = 'document.drivers_license.back.image' THEN 'document.drivers_license.back'
    WHEN kind = 'document.drivers_license.selfie.image' THEN 'document.drivers_license.selfie'
    WHEN kind = 'document.id_card.front.image' THEN 'document.id_card.front'
    WHEN kind = 'document.id_card.back.image' THEN 'document.id_card.back'
    WHEN kind = 'document.id_card.selfie.image' THEN 'document.id_card.selfie'
    ELSE kind
END;

UPDATE document_data
SET kind = CASE
    WHEN kind = 'passport.front.image' THEN 'passport'
    WHEN kind = 'passport.selfie.image' THEN 'passport.selfie'
    WHEN kind = 'drivers_license.front.image' THEN 'drivers_license.front'
    WHEN kind = 'drivers_license.back.image' THEN 'drivers_license.back'
    WHEN kind = 'drivers_license.selfie.image' THEN 'drivers_license.selfie'
    WHEN kind = 'id_card.front.image' THEN 'id_card.front'
    WHEN kind = 'id_card.back.image' THEN 'id_card.back'
    WHEN kind = 'id_card.selfie.image' THEN 'id_card.selfie'
    ELSE kind
END;

UPDATE access_event
SET targets = (
    SELECT array_agg(CASE
        WHEN target = 'document.passport.front.image' THEN 'document.passport'
        WHEN target = 'document.passport.selfie.image' THEN 'document.passport.selfie'
        WHEN target = 'document.drivers_license.front.image' THEN 'document.drivers_license.front'
        WHEN target = 'document.drivers_license.back.image' THEN 'document.drivers_license.back'
        WHEN target = 'document.drivers_license.selfie.image' THEN 'document.drivers_license.selfie'
        WHEN target = 'document.id_card.front.image' THEN 'document.id_card.front'
        WHEN target = 'document.id_card.back.image' THEN 'document.id_card.back'
        WHEN target = 'document.id_card.selfie.image' THEN 'document.id_card.selfie'
        ELSE target
    END)
    FROM unnest(targets) as target
)
WHERE
    (SELECT TRUE FROM UNNEST(targets) AS target WHERE target ilike 'document.%' LIMIT 1);