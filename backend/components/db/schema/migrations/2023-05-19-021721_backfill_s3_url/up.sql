UPDATE identity_document
    SET front_image_s3_url = doc.s3_url -- change
    FROM document_data doc
    WHERE doc.lifetime_id = identity_document.front_lifetime_id AND -- change
         front_image_s3_url is null;

UPDATE identity_document
    SET back_image_s3_url = doc.s3_url -- change
    FROM document_data doc
    WHERE doc.lifetime_id = identity_document.back_lifetime_id AND -- change
        back_image_s3_url is null;

UPDATE identity_document
    SET selfie_image_s3_url = doc.s3_url -- change
    FROM document_data doc
    WHERE doc.lifetime_id = identity_document.selfie_lifetime_id AND -- change
        selfie_image_s3_url is null;