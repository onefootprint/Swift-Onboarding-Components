UPDATE data_lifetime
SET kind = CASE
    WHEN kind='id.first_name' THEN 'first_name'
    WHEN kind='id.last_name' THEN 'last_name'
    WHEN kind='id.dob' THEN 'dob'
    WHEN kind='id.ssn4' THEN 'ssn4'
    WHEN kind='id.ssn9' THEN 'ssn9'
    WHEN kind='id.address_line1' THEN 'address_line1'
    WHEN kind='id.address_line2' THEN 'address_line2'
    WHEN kind='id.city' THEN 'city'
    WHEN kind='id.state' THEN 'state'
    WHEN kind='id.zip' THEN 'zip'
    WHEN kind='id.country' THEN 'country'
    WHEN kind='id.email' THEN 'email'
    WHEN kind='id.phone_number' THEN 'phone_number'
    ELSE kind
END;