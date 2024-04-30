-- 50K rows to update

UPDATE rule_instance
SET kind = 'business'
WHERE rule_expression in (
    '[{"op":"not_eq","field":"tin_match","value":true}]'::jsonb,
    '[{"op":"eq","field":"beneficial_owner_failed_kyc","value":true}]'::jsonb,
    '[{"op":"eq","field":"business_name_watchlist_hit","value":true}]'::jsonb,
    '[{"op":"not_eq","field":"business_name_match","value":true},{"op":"not_eq","field":"business_name_similar_match","value":true}]'::jsonb,
    '[{"op":"not_eq","field":"business_address_match","value":true},{"op":"not_eq","field":"business_address_close_match","value":true},{"op":"not_eq","field":"business_address_similar_match","value":true}]'::jsonb
    );