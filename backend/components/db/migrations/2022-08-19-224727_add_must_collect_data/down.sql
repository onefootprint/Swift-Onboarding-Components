ALTER TABLE ob_configuration
    ADD COLUMN must_collect_data_kinds TEXT[] NOT NULL DEFAULT ARRAY['FirstName', 'LastName', 'Dob', 'Ssn9', 'AddressLine1', 'AddressLine2', 'City', 'State', 'Zip', 'Country', 'Email', 'PhoneNumber'],
    ADD COLUMN can_access_data_kinds TEXT[] NOT NULL DEFAULT ARRAY['FirstName', 'LastName', 'Dob', 'Ssn9', 'AddressLine1', 'AddressLine2', 'City', 'State', 'Zip', 'Country', 'Email', 'PhoneNumber'];

ALTER TABLE ob_configuration
    ALTER COLUMN must_collect_data_kinds DROP DEFAULT,
    ALTER COLUMN can_access_data_kinds DROP DEFAULT,
    DROP COLUMN must_collect_data,
    DROP COLUMN can_access_data;