UPDATE ob_configuration
SET verification_checks = 
    CASE 
    WHEN 
        -- vc is present
        verification_checks IS NOT NULL AND
        -- kyc isn't already in it (prevent dupes)
        not ('{"kind": "kyc", "data": {}}'::jsonb = ANY(verification_checks))
        -- append kyc VC to existing
        THEN verification_checks || '{"kind": "kyc", "data": {}}'::jsonb
        -- otherwise create new verification checks with kyc
    ELSE ARRAY['{"kind": "kyc", "data": {}}'::jsonb]
    END
WHERE NOT skip_kyc;
