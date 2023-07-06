UPDATE risk_signal
SET reason_code = 'address_newer_record_found'
WHERE reason_code = 'newer_record_found';