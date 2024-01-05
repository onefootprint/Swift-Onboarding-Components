-- Will have already run this as a batch backfill before getting here
UPDATE vault SET is_identifiable = is_portable WHERE is_identifiable IS NULL;

ALTER TABLE vault ALTER COLUMN is_identifiable SET NOT NULL;