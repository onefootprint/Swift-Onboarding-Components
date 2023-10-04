-- TODO rm default
ALTER TABLE tenant ADD COLUMN is_prod_kyb_playbook_restricted BOOLEAN NOT NULL DEFAULT 't';