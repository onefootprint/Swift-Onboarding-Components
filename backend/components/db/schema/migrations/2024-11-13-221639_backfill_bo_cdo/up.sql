-- Update user_timeline
-- SELECT count(*) FROM user_timeline WHERE event->'data'->'attributes' ? 'business_beneficial_owners' AND event_kind = 'data_collected';
UPDATE user_timeline SET event = jsonb_set(event, '{data,attributes}', ((event->'data'->'attributes')::jsonb - 'business_beneficial_owners') || jsonb_build_array('business_kyced_beneficial_owners')) WHERE event->'data'->'attributes' ? 'business_beneficial_owners' AND event_kind = 'data_collected';


-- Update tenant_role
-- SELECT * FROM tenant_role WHERE jsonb_build_object('kind', 'decrypt', 'data', 'business_beneficial_owners') = ANY(scopes);
-- None to update



-- Update workflow_request
-- SELECT * FROM workflow_request WHERE config->'data'->'recollect_attributes' ? 'business_beneficial_owners';
-- None to update


-- Update ob_configuration
-- SELECT tenant_id, count(*) FROM ob_configuration WHERE 'business_beneficial_owners' = ANY(must_collect_data) OR 'business_beneficial_owners' = ANY(can_access_data) OR 'business_beneficial_owners' = ANY(optional_data) GROUP BY 1;

UPDATE ob_configuration
SET
    must_collect_data = ARRAY_REPLACE(must_collect_data, 'business_beneficial_owners', 'business_kyced_beneficial_owners'),
    can_access_data = ARRAY_REPLACE(can_access_data, 'business_beneficial_owners', 'business_kyced_beneficial_owners'),
    optional_data = ARRAY_REPLACE(optional_data, 'business_beneficial_owners', 'business_kyced_beneficial_owners')
WHERE
    'business_beneficial_owners' = ANY(must_collect_data)
    OR 'business_beneficial_owners' = ANY(can_access_data)
    OR 'business_beneficial_owners' = ANY(optional_data);
