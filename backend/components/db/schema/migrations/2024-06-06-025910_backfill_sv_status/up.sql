-- TODO run in prod manually before merging
UPDATE scoped_vault SET status = 'none' WHERE status IS NULL;