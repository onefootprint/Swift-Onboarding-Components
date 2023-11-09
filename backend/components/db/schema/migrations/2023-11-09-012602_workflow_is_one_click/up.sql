-- TODO rm default
ALTER TABLE workflow ADD COLUMN is_one_click BOOLEAN NOT NULL DEFAULT 'f';
