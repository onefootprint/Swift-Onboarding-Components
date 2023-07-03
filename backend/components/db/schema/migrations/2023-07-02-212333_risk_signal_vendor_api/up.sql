ALTER TABLE risk_signal ADD COLUMN vendor_api TEXT;
UPDATE risk_signal
SET vendor_api = CASE
    WHEN vendors = '{incode}' THEN 'incode_watchlist_check'
    WHEN vendors = '{idology}' THEN 'idology_expect_id'
    WHEN vendors = '{socure}' THEN 'socure_id_plus'
    WHEN vendors = '{middesk}' THEN 'middesk_business_update_webhook'
    WHEN vendors = '{experian}' THEN 'experian_precise_id'
    ELSE NULL
END;
ALTER TABLE risk_signal ALTER COLUMN vendor_api SET NOT NULL;

ALTER TABLE risk_signal DROP COLUMN vendors;