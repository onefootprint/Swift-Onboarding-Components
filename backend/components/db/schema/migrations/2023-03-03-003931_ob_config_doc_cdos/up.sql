UPDATE ob_configuration SET must_collect_data = CASE
    WHEN must_collect_identity_document AND must_collect_selfie THEN ARRAY_APPEND(must_collect_data, 'document_and_selfie')
    WHEN must_collect_identity_document AND must_collect_selfie = 'f' THEN ARRAY_APPEND(must_collect_data, 'document')
    ELSE must_collect_data
END;

UPDATE ob_configuration SET can_access_data = CASE
    WHEN can_access_identity_document_images AND can_access_selfie_image THEN ARRAY_APPEND(can_access_data, 'document_and_selfie')
    WHEN can_access_identity_document_images AND can_access_selfie_image = 'f' THEN ARRAY_APPEND(can_access_data, 'document')
    ELSE can_access_data
END;

-- Had to split this into two migrations, dropping these columns in the follow-up migration