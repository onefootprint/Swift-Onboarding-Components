ALTER TABLE tenant ADD COLUMN is_demo_tenant BOOLEAN DEFAULT false;

UPDATE tenant 
SET is_demo_tenant = false;

ALTER TABLE tenant ALTER COLUMN is_demo_tenant SET NOT NULL;-- Your SQL goes here