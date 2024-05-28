-- 12.2K records in prod
UPDATE ob_configuration
SET verification_checks = ARRAY[json_build_object('kind', 'kyb', 'data', json_build_object('ein_only', 'false'))]::jsonb[]
WHERE 
    kind = 'kyb' and 
    not skip_kyb and 
    verification_checks is null