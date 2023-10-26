UPDATE ob_configuration
SET kind = 'kyb'
WHERE kind IS NULL AND must_collect_data @> array['business_name']::text[];

UPDATE ob_configuration
SET kind = 'kyc'
WHERE kind IS NULL AND NOT 'business_name' = ANY(must_collect_data);

ALTER TABLE ob_configuration ALTER  COLUMN kind SET NOT NULL;