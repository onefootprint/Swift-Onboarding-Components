ALTER TABLE contact_info ADD COLUMN is_otp_verified BOOL;

UPDATE contact_info ci
SET is_otp_verified = is_verified AND di.kind = 'id.phone_number'
FROM data_lifetime di 
WHERE di.id = ci.lifetime_id;

ALTER TABLE contact_info ALTER COLUMN is_otp_verified SET NOT NULL;
ALTER TABLE contact_info ALTER COLUMN is_otp_verified SET DEFAULT false;