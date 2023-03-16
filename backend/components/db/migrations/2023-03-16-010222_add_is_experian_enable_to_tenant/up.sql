ALTER TABLE tenant ADD COLUMN is_experian_enabled BOOLEAN DEFAULT false;

UPDATE tenant 
SET is_experian_enabled = false;

ALTER TABLE tenant ALTER COLUMN is_experian_enabled SET NOT NULL;