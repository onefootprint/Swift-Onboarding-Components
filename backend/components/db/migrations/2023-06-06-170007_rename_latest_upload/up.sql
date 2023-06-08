UPDATE document_data
SET kind =  
    CASE
        WHEN kind = 'latest_upload.passport.front'          THEN 'passport.front.latest_upload'
        WHEN kind = 'latest_upload.passport.selfie'         THEN 'passport.selfie.latest_upload'
        WHEN kind = 'latest_upload.drivers_license.front'   THEN 'drivers_license.front.latest_upload'
        WHEN kind = 'latest_upload.drivers_license.back'    THEN 'drivers_license.back.latest_upload'
        WHEN kind = 'latest_upload.drivers_license.selfie'  THEN 'drivers_license.selfie.latest_upload'
        WHEN kind = 'latest_upload.id_card.front'           THEN 'id_card.front.latest_upload'
        WHEN kind = 'latest_upload.id_card.back'            THEN 'id_card.back.latest_upload'
        WHEN kind = 'latest_upload.id_card.selfie'          THEN 'id_card.selfie.latest_upload'
        ELSE kind
    END;


UPDATE data_lifetime
SET kind =  
    CASE
        WHEN kind = 'document.latest_upload.passport.front'          THEN 'document.passport.front.latest_upload'
        WHEN kind = 'document.latest_upload.passport.selfie'         THEN 'document.passport.selfie.latest_upload'
        WHEN kind = 'document.latest_upload.drivers_license.front'   THEN 'document.drivers_license.front.latest_upload'
        WHEN kind = 'document.latest_upload.drivers_license.back'    THEN 'document.drivers_license.back.latest_upload'
        WHEN kind = 'document.latest_upload.drivers_license.selfie'  THEN 'document.drivers_license.selfie.latest_upload'
        WHEN kind = 'document.latest_upload.id_card.front'           THEN 'document.id_card.front.latest_upload'
        WHEN kind = 'document.latest_upload.id_card.back'            THEN 'document.id_card.back.latest_upload'
        WHEN kind = 'document.latest_upload.id_card.selfie'          THEN 'document.id_card.selfie.latest_upload'
        ELSE kind
    END;

