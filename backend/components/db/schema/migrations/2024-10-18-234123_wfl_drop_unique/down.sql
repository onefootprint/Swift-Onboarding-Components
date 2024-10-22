-- Normally a unique index, not making it unique for the down.sql though
CREATE INDEX IF NOT EXISTS business_workflow_link_user_workflow_id ON business_workflow_link(user_workflow_id);