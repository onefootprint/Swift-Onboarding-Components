SET CONSTRAINTS ALL IMMEDIATE;

DELETE FROM tenant_role WHERE kind IS NULL;
ALTER TABLE tenant_role ALTER COLUMN kind SET NOT NULL;