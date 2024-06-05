-- TODO run in prod manually before merging
UPDATE workflow SET status = 'incomplete' WHERE status IS NULL;