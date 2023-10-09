UPDATE tenant SET domains = ARRAY[domain]::TEXT[] WHERE domain IS NOT NULL;
ALTER TABLE tenant ALTER COLUMN domains DROP DEFAULT;

ALTER TABLE tenant DROP COLUMN domain;