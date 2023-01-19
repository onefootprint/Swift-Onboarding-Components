UPDATE ob_configuration
SET must_collect_data = (
    SELECT array_agg(CASE
        WHEN cdo = 'Name' THEN 'name'
        WHEN cdo = 'Dob' THEN 'dob'
        WHEN cdo = 'Ssn4' THEN 'ssn4'
        WHEN cdo = 'Ssn9' THEN 'ssn9'
        WHEN cdo = 'FullAddress' THEN 'full_address'
        WHEN cdo = 'PartialAddress' THEN 'partial_address'
        WHEN cdo = 'Email' THEN 'email'
        WHEN cdo = 'PhoneNumber' THEN 'phone_number'
        ELSE cdo
    END)
    FROM unnest(must_collect_data) as cdo
)
WHERE must_collect_data <> ARRAY[]::TEXT[];

UPDATE ob_configuration
SET can_access_data = (
    SELECT array_agg(CASE
        WHEN cdo = 'Name' THEN 'name'
        WHEN cdo = 'Dob' THEN 'dob'
        WHEN cdo = 'Ssn4' THEN 'ssn4'
        WHEN cdo = 'Ssn9' THEN 'ssn9'
        WHEN cdo = 'FullAddress' THEN 'full_address'
        WHEN cdo = 'PartialAddress' THEN 'partial_address'
        WHEN cdo = 'Email' THEN 'email'
        WHEN cdo = 'PhoneNumber' THEN 'phone_number'
        ELSE cdo
    END)
    FROM unnest(can_access_data) as cdo
)
WHERE can_access_data <> ARRAY[]::TEXT[];