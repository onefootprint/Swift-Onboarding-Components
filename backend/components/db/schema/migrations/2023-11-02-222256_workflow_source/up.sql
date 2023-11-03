-- TODO rm default
ALTER TABLE workflow ADD COLUMN source TEXT NOT NULL DEFAULT 'unknown';