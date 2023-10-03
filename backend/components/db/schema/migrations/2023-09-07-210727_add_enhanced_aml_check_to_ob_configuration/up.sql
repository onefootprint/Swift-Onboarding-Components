-- NOTE: this initially had version 20230906210727, but it was landed after 2023-09-07-145402_add_doc_scan_for_optional_ssn which had an earlier version.
-- So, this migration was later renamed to have a later version so that it is applied chronologically in the same order in which it exists in schema.rs

ALTER TABLE ob_configuration ADD COLUMN IF NOT EXISTS enhanced_aml JSONB NOT NULL DEFAULT '{"kind": "no"}';