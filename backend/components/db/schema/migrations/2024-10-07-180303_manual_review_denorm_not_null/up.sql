-- This will lock the table when it runs, but there are only 65k rows
ALTER TABLE manual_review ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE manual_review ALTER COLUMN is_live SET NOT NULL;