UPDATE ob_configuration
SET verification_checks = 
    CASE 
    WHEN 
        -- vc is present
        verification_checks IS NOT NULL AND

        -- business_aml isn't already in it (prevent dupes)
        NOT ('{"kind": "business_aml", "data": {}}'::jsonb = ANY(verification_checks))

        -- append business_aml VC to existing verification checks
        THEN verification_checks || '{"kind": "business_aml", "data": {}}'::jsonb
        
    -- otherwise use existing verification checks
    ELSE verification_checks
    END
WHERE EXISTS (
    SELECT 1 FROM UNNEST(verification_checks) AS verification_check 
    WHERE verification_check->>'kind' = 'kyb'
);