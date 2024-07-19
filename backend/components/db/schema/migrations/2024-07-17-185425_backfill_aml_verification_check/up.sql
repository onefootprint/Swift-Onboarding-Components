UPDATE ob_configuration
SET verification_checks = 
    CASE 
    WHEN 
        -- vc is present
        verification_checks IS NOT NULL 
        -- aml isn't already in it (prevent dupes)
        AND NOT (json_build_object('data', enhanced_aml->'data', 'kind', 'aml')::jsonb = ANY(verification_checks))
        -- append AML VC to existing
    THEN verification_checks || json_build_object('data', enhanced_aml->'data', 'kind', 'aml')::jsonb
        -- if we are doing AML checks, but was created before we started sending non-null verif checks all the time
    ELSE ARRAY[json_build_object('data', enhanced_aml->'data', 'kind', 'aml')::jsonb]
    END
WHERE 
    enhanced_aml->>'kind' = 'yes' 
    OR (enhanced_aml->>'kind' = 'no' AND cip_kind = 'alpaca')