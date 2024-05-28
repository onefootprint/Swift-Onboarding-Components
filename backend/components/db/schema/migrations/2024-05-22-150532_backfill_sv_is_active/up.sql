-- TODO run this manually before merging
UPDATE scoped_vault SET is_active = 'f' WHERE deactivated_at IS NOT NULL;
UPDATE scoped_vault SET is_active = 'f' WHERE show_in_search = 'f';