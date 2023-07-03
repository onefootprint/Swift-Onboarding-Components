ALTER TABLE risk_signal ADD COLUMN vendors TEXT[];
UPDATE risk_signal
SET vendors = CASE
    WHEN vendor_api = 'incode_watchlist_check' THEN ARRAY['incode']
    WHEN vendor_api = 'idology_expect_id' THEN ARRAY['idology']
    WHEN vendor_api = 'socure_id_plus' THEN ARRAY['socure']
    WHEN vendor_api = 'middesk_business_update_webhook' THEN ARRAY['middesk']
    WHEN vendor_api = 'experian_precise_id' THEN ARRAY['experian']
    ELSE NULL
END;
ALTER TABLE risk_signal ALTER COLUMN vendors SET NOT NULL;

ALTER TABLE risk_signal DROP COLUMN vendor_api;
