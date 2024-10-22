UPDATE ob_configuration
SET verification_checks = (
    SELECT ARRAY(
        SELECT
            CASE
                -- Check if the 'kind' is 'aml' and update 'match_kind'
                WHEN verification_check->>'kind' = 'aml' AND (verification_check->'data'->>'match_kind') IS NULL THEN
                    -- Insert 'match_kind' into 'data' without overwriting existing fields.
                    jsonb_set(
                        verification_check,
                        '{data,match_kind}',
                        '"exact_name_and_dob_year"',
                        true -- Ensures that no existing fields inside 'data' are overwritten
                    )
                ELSE
                    verification_check
            END
        FROM UNNEST(verification_checks) as verification_check
    )
)
WHERE tenant_id = 'org_HfhfuQan6A6EXIYuFDwyNZ'
AND EXISTS (
    SELECT 1
    FROM UNNEST(verification_checks) as verification_check
    WHERE verification_check->>'kind' = 'aml'
);