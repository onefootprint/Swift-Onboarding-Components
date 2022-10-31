ALTER TABLE verification_request ADD COLUMN vendor_api TEXT;

UPDATE verification_request SET vendor_api = 'twilio_lookup_v2' WHERE vendor = 'twilio';
UPDATE verification_request SET vendor_api = 'idology_expectid' WHERE vendor = 'idology';

ALTER TABLE verification_request 
    ALTER COLUMN vendor_api SET NOT NULL;