UPDATE data_lifetime
SET kind = CASE
    WHEN kind='first_name' THEN 'id.first_name'
    WHEN kind='last_name' THEN 'id.last_name'
    WHEN kind='dob' THEN 'id.dob'
    WHEN kind='ssn4' THEN 'id.ssn4'
    WHEN kind='ssn9' THEN 'id.ssn9'
    WHEN kind='address_line1' THEN 'id.address_line1'
    WHEN kind='address_line2' THEN 'id.address_line2'
    WHEN kind='city' THEN 'id.city'
    WHEN kind='state' THEN 'id.state'
    WHEN kind='zip' THEN 'id.zip'
    WHEN kind='country' THEN 'id.country'
    WHEN kind='email' THEN 'id.email'
    WHEN kind='phone_number' THEN 'id.phone_number'
    ELSE kind
END;

UPDATE data_lifetime
SET kind = 'custom.' || kv_data.data_key
FROM kv_data
WHERE kv_data.lifetime_id = data_lifetime.id AND kind = 'custom';

UPDATE data_lifetime
SET kind = 'id_document.' || identity_document.document_type
FROM identity_document
WHERE identity_document.lifetime_id = data_lifetime.id AND kind = 'identity_document';