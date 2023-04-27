ALTER TABLE verification_result ADD COLUMN is_error BOOLEAN DEFAULT false;

UPDATE verification_result
SET is_error = false;

ALTER TABLE verification_result
ALTER COLUMN is_error SET NOT NULL;