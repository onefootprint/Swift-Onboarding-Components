ALTER TABLE billing_profile ADD COLUMN prices JSONB NOT NULL DEFAULT jsonb_build_object();
UPDATE billing_profile SET prices = jsonb_strip_nulls(jsonb_build_object(
    'monthly_platform_fee', monthly_platform_fee,
    'kyc', kyc,
    'one_click_kyc', one_click_kyc,
    'kyc_waterfall_second_vendor', kyc_waterfall_second_vendor,
    'kyc_waterfall_third_vendor', kyc_waterfall_third_vendor,
    'continuous_monitoring_per_year', continuous_monitoring_per_year,
    -- TODO this one has a different name in the API
    'adverse_media_per_onboarding', adverse_media_per_user,
    'kyb', kyb,
    'kyb_ein_only', kyb_ein_only,
    'id_docs', id_docs,
    -- TODO different name in API
    'watchlist_checks', watchlist,
    'curp_verification', curp_verification,
    'pii', pii,
    'vaults_with_non_pci', vaults_with_non_pci,
    'vaults_with_pci', vaults_with_pci,
    'hot_proxy_vaults', hot_proxy_vaults,
    'hot_vaults', hot_vaults
));