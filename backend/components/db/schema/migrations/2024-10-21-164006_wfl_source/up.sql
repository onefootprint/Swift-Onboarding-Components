-- TODO drop default
ALTER TABLE business_workflow_link ADD COLUMN source TEXT NOT NULL DEFAULT 'hosted';