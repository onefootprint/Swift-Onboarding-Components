UPDATE data_lifetime SET kind = 'business.ein' WHERE kind = 'business.tin';
UPDATE vault_data SET kind = 'business.ein' WHERE kind = 'business.tin';

UPDATE ob_configuration
SET must_collect_data = (
    SELECT array_agg(REPLACE(target, 'business_tin', 'business_ein'))
    FROM unnest(must_collect_data) as target
)
WHERE must_collect_data <> ARRAY[]::TEXT[];
UPDATE ob_configuration
SET can_access_data = (
    SELECT array_agg(REPLACE(target, 'business_tin', 'business_ein'))
    FROM unnest(can_access_data) as target
)
WHERE can_access_data <> ARRAY[]::TEXT[];