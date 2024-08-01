ALTER TABLE billing_profile ADD COLUMN billing_email TEXT;
ALTER TABLE billing_profile ADD COLUMN omit_billing BOOLEAN NOT NULL DEFAULT 'f';
ALTER TABLE billing_profile ADD COLUMN send_automatically BOOLEAN NOT NULL DEFAULT 'f';