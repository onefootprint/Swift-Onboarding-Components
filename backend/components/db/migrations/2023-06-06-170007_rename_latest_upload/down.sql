UPDATE document_data
SET kind =  
    CASE
        WHEN kind = 'passport.front.latest_upload'            THEN 'latest_upload.passport.front'        
        WHEN kind = 'passport.selfie.latest_upload'           THEN 'latest_upload.passport.selfie'       
        WHEN kind = 'drivers_license.front.latest_upload'     THEN 'latest_upload.drivers_license.front' 
        WHEN kind = 'drivers_license.back.latest_upload'      THEN 'latest_upload.drivers_license.back'  
        WHEN kind = 'drivers_license.selfie.latest_upload'    THEN 'latest_upload.drivers_license.selfie'
        WHEN kind = 'id_card.front.latest_upload'             THEN 'latest_upload.id_card.front'         
        WHEN kind = 'id_card.back.latest_upload'              THEN 'latest_upload.id_card.back'          
        WHEN kind = 'id_card.selfie.latest_upload'            THEN 'latest_upload.id_card.selfie'        
        ELSE kind
    END;

UPDATE data_lifetime
SET kind =  
    CASE
        WHEN kind = 'document.passport.front.latest_upload'            THEN 'document.latest_upload.passport.front'        
        WHEN kind = 'document.passport.selfie.latest_upload'           THEN 'document.latest_upload.passport.selfie'       
        WHEN kind = 'document.drivers_license.front.latest_upload'     THEN 'document.latest_upload.drivers_license.front' 
        WHEN kind = 'document.drivers_license.back.latest_upload'      THEN 'document.latest_upload.drivers_license.back'  
        WHEN kind = 'document.drivers_license.selfie.latest_upload'    THEN 'document.latest_upload.drivers_license.selfie'
        WHEN kind = 'document.id_card.front.latest_upload'             THEN 'document.latest_upload.id_card.front'         
        WHEN kind = 'document.id_card.back.latest_upload'              THEN 'document.latest_upload.id_card.back'          
        WHEN kind = 'document.id_card.selfie.latest_upload'            THEN 'document.latest_upload.id_card.selfie'        
        ELSE kind
    END;