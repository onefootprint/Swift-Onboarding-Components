UPDATE user_vault_data
SET kind = CASE
    WHEN kind='first_name' then 'id.first_name'
    WHEN kind='last_name' then 'id.last_name'
    WHEN kind='dob' then 'id.dob'
    WHEN kind='ssn4' then 'id.ssn4'
    WHEN kind='ssn9' then 'id.ssn9'
    WHEN kind='address_line1' then 'id.address_line1'
    WHEN kind='address_line2' then 'id.address_line2'
    WHEN kind='city' then 'id.city'
    WHEN kind='state' then 'id.state'
    WHEN kind='zip' then 'id.zip'
    WHEN kind='country' then 'id.country'
    ELSE kind
END;

