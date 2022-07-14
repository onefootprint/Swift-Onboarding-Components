ALTER TABLE ob_configurations RENAME COLUMN required_user_data TO must_collect_data_kinds;
ALTER TABLE ob_configurations ADD COLUMN can_access_data_kinds TEXT[] NOT NULL DEFAULT CAST(ARRAY[] as TEXT[]);
ALTER TABLE ob_configurations ALTER COLUMN can_access_data_kinds DROP DEFAULT;