UPDATE billing_profile
SET minimums = array[jsonb_build_object(
    'products', array['id_docs', 'kyb', 'kyb_ein_only', 'watchlist_checks', 'kyc', 'one_click_kyc', 'kyc_waterfall_second_vendor', 'kyc_waterfall_third_vendor', 'adverse_media_per_onboarding', 'continuous_monitoring_per_year', 'adverse_media_per_year', 'samba_activity_history', 'sentilink_score', 'neuro_id_behavioral', 'curp_verification']::text[],
    'amount_cents', prices->>'monthly_minimum_on_identity',
    'name', 'Identity',
    'starts_on', null
)]::jsonb[]
WHERE prices->'monthly_minimum_on_identity' IS NOT NULL;

UPDATE billing_profile SET prices = prices - 'monthly_minimum_on_identity';