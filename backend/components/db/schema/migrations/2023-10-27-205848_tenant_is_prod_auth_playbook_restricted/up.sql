-- TODO drop default
ALTER TABLE TENANT ADD COLUMN is_prod_auth_playbook_restricted BOOLEAN NOT NULL DEFAULT 't';