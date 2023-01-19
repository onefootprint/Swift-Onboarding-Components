UPDATE ob_configuration
SET must_collect_data = (
    SELECT array_agg(CASE
        WHEN cdo = 'name' THEN 'Name'
        WHEN cdo = 'dob' THEN 'Dob'
        WHEN cdo = 'ssn4' THEN 'Ssn4'
        WHEN cdo = 'ssn9' THEN 'Ssn9'
        WHEN cdo = 'full_address' THEN 'FullAddress'
        WHEN cdo = 'partial_address' THEN 'PartialAddress'
        WHEN cdo = 'email' THEN 'Email'
        WHEN cdo = 'phone_number' THEN 'PhoneNumber'
        ELSE cdo
    END)
    FROM unnest(must_collect_data) as cdo
)
WHERE must_collect_data <> ARRAY[]::TEXT[];

UPDATE ob_configuration
SET can_access_data = (
    SELECT array_agg(CASE
        WHEN cdo = 'name' THEN 'Name'
        WHEN cdo = 'dob' THEN 'Dob'
        WHEN cdo = 'ssn4' THEN 'Ssn4'
        WHEN cdo = 'ssn9' THEN 'Ssn9'
        WHEN cdo = 'full_address' THEN 'FullAddress'
        WHEN cdo = 'partial_address' THEN 'PartialAddress'
        WHEN cdo = 'email' THEN 'Email'
        WHEN cdo = 'phone_number' THEN 'PhoneNumber'
        ELSE cdo
    END)
    FROM unnest(can_access_data) as cdo
)
WHERE can_access_data <> ARRAY[]::TEXT[];