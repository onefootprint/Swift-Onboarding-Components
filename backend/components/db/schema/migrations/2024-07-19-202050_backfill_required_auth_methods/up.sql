UPDATE ob_configuration
SET required_auth_methods = CASE
    WHEN kind = 'auth' or kind = 'document' THEN NULL
    WHEN kind = 'kyc' or kind = 'kyb' THEN CASE
        WHEN is_no_phone_flow THEN ARRAY['email']::TEXT[]
        ELSE ARRAY['phone']::TEXT[]
    END
    ELSE NULL
END
WHERE required_auth_methods IS NULL AND kind != 'auth' AND kind != 'document';