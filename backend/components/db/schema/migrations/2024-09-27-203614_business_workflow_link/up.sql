CREATE TABLE business_workflow_link (
    id text PRIMARY KEY DEFAULT prefixed_uid('bwl_'),
    _created_at timestamptz NOT NULL DEFAULT NOW(),
    _updated_at timestamptz NOT NULL DEFAULT NOW(),
    business_owner_id TEXT NOT NULL,
    business_workflow_id TEXT NOT NULL,
    user_workflow_id TEXT NOT NULL,
    CONSTRAINT fk_business_workflow_link_business_owner_id
        FOREIGN KEY(business_owner_id) 
        REFERENCES business_owner(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_business_workflow_link_business_workflow_id
        FOREIGN KEY(business_workflow_id) 
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT fk_business_workflow_link_user_workflow_id
        FOREIGN KEY(user_workflow_id) 
        REFERENCES workflow(id)
        DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS business_workflow_link_business_owner_id ON business_workflow_link(business_owner_id);
CREATE INDEX IF NOT EXISTS business_workflow_link_business_workflow_id ON business_workflow_link(business_workflow_id);
-- Every user workflow should only be linked to one business workflow
CREATE UNIQUE INDEX IF NOT EXISTS business_workflow_link_user_workflow_id ON business_workflow_link(user_workflow_id);

SELECT diesel_manage_updated_at('business_workflow_link');