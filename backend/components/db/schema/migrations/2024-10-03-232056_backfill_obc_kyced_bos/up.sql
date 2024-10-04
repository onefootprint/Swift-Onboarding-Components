update ob_configuration
set
    must_collect_data = array_replace(must_collect_data, 'business_beneficial_owners', 'business_kyced_beneficial_owners'),
    can_access_data = array_replace(can_access_data, 'business_beneficial_owners', 'business_kyced_beneficial_owners')
where must_collect_data @> array['business_beneficial_owners']::text[];