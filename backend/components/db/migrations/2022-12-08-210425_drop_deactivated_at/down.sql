ALTER TABLE phone_number ADD COLUMN deactivated_at TIMESTAMPTZ;
ALTER TABLE email ADD COLUMN deactivated_at TIMESTAMPTZ;