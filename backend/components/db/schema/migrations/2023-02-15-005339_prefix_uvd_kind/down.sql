UPDATE user_vault_data
SET kind = CASE
    WHEN kind='id.first_name' then 'first_name'
    WHEN kind='id.last_name' then 'last_name'
    WHEN kind='id.dob' then 'dob'
    WHEN kind='id.ssn4' then 'ssn4'
    WHEN kind='id.ssn9' then 'ssn9'
    WHEN kind='id.address_line1' then 'address_line1'
    WHEN kind='id.address_line2' then 'address_line2'
    WHEN kind='id.city' then 'city'
    WHEN kind='id.state' then 'state'
    WHEN kind='id.zip' then 'zip'
    WHEN kind='id.country' then 'country'
    ELSE kind
END;