ALTER TABLE user_consent ADD COLUMN ml_consent BOOLEAN;

UPDATE user_consent SET ml_consent = false;

ALTER TABLE user_consent ALTER COLUMN ml_consent SET NOT NULL;