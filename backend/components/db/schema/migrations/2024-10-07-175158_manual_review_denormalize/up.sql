ALTER TABLE manual_review
    ADD COLUMN tenant_id TEXT,
    ADD COLUMN is_live BOOLEAN,
    ADD CONSTRAINT fk_manual_review_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX manual_review_tenant_id ON manual_review(tenant_id);