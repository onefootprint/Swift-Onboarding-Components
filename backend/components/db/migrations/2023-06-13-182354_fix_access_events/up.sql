UPDATE access_event
SET targets = (
    SELECT array_agg(CASE
        WHEN target = 'document.drivers_license_front' THEN 'document.drivers_license.front'
        WHEN target = 'document.drivers_license_back' THEN 'document.drivers_license.back'
        WHEN target = 'document.drivers_license_selfie' THEN 'document.drivers_license.selfie'
        WHEN target = 'document.passport_selfie' THEN 'document.passport.selfie'
        WHEN target = 'document.id_card_front' THEN 'document.id_card.front'
        WHEN target = 'document.id_card_back' THEN 'document.id_card.back'
        WHEN target = 'document.id_card_selfie' THEN 'document.id_card.selfie'

        WHEN target = 'document.latest_upload.drivers_license.front' THEN 'document.drivers_license.front.latest_upload'
        WHEN target = 'document.latest_upload.drivers_license.back' THEN 'document.drivers_license.back.latest_upload'
        WHEN target = 'document.latest_upload.drivers_license.selfie' THEN 'document.drivers_license.selfie.latest_upload'
        WHEN target = 'document.latest_upload.id_card.front' THEN 'document.id_card.front.latest_upload'
        WHEN target = 'document.latest_upload.id_card.back' THEN 'document.id_card.back.latest_upload'
        WHEN target = 'document.latest_upload.id_card.selfie' THEN 'document.id_card.selfie.latest_upload'
        WHEN target = 'document.latest_upload.passport.front' THEN 'document.passport.front.latest_upload'
        WHEN target = 'document.latest_upload.passport.back' THEN 'document.passport.back.latest_upload'
        WHEN target = 'document.latest_upload.passport.selfie' THEN 'document.passport.selfie.latest_upload'
        ELSE target
    END)
    FROM unnest(targets) as target
)
WHERE
    kind = 'decrypt' AND
    (SELECT TRUE FROM UNNEST(targets) AS target WHERE target ilike 'document.%' LIMIT 1);