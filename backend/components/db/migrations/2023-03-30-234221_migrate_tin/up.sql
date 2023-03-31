UPDATE data_lifetime SET kind = 'business.tin' WHERE kind = 'business.ein';
UPDATE vault_data SET kind = 'business.tin' WHERE kind = 'business.ein';

UPDATE ob_configuration
SET must_collect_data = (
    SELECT array_agg(REPLACE(target, 'business_ein', 'business_tin'))
    FROM unnest(must_collect_data) as target
)
WHERE must_collect_data <> ARRAY[]::TEXT[];
UPDATE ob_configuration
SET can_access_data = (
    SELECT array_agg(REPLACE(target, 'business_ein', 'business_tin'))
    FROM unnest(can_access_data) as target
)
WHERE can_access_data <> ARRAY[]::TEXT[];

-- Only integration test access events for now
DELETE FROM access_event WHERE targets @> ARRAY['business.ein'];
DELETE FROM user_timeline WHERE event->'data'->'attributes' @> '["business_ein"]';