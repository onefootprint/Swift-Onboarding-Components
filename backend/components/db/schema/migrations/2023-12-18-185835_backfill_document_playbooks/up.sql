UPDATE ob_configuration
SET kind = 'document'
WHERE
    skip_kyc AND skip_confirm AND
    -- All must_collect_data is document
    (SELECT COUNT(cdo) FROM UNNEST(must_collect_data) AS cdo WHERE cdo ILIKE 'document%') = ARRAY_LENGTH(must_collect_data, 1) AND
    -- All can_access_data is document
    (SELECT COUNT(cdo) FROM UNNEST(can_access_data) AS cdo WHERE cdo ILIKE 'document%') = ARRAY_LENGTH(can_access_data, 1);