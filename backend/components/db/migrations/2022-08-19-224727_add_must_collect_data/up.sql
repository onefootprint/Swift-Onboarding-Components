ALTER TABLE ob_configuration
    ADD COLUMN must_collect_data TEXT[] NOT NULL DEFAULT ARRAY['Name', 'Dob', 'Ssn9', 'FullAddress', 'Email', 'PhoneNumber'],
    ADD COLUMN can_access_data TEXT[] NOT NULL DEFAULT ARRAY['Name', 'Dob', 'Ssn9', 'FullAddress', 'Email', 'PhoneNumber'];

ALTER TABLE ob_configuration
    ALTER COLUMN must_collect_data DROP DEFAULT,
    ALTER COLUMN can_access_data DROP DEFAULT,
    DROP COLUMN must_collect_data_kinds,
    DROP COLUMN can_access_data_kinds;