ALTER TABLE user_vault ADD COLUMN kind TEXT NOT NULL DEFAULT 'person';
ALTER TABLE user_vault ALTER COLUMN kind DROP DEFAULT;