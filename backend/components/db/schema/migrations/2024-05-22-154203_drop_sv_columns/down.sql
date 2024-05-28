ALTER TABLE scoped_vault ADD COLUMN is_billable BOOL NOT NULL DEFAULT 't';
ALTER TABLE scoped_vault ADD COLUMN show_in_search BOOL NOT NULL DEFAULT 't';