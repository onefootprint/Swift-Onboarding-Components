ALTER TABLE scoped_vault_tag
    ADD COLUMN tenant_id TEXT,
    ADD COLUMN is_live BOOLEAN,
    ADD CONSTRAINT fk_scoped_vault_tag_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX scoped_vault_tag_tenant_id ON scoped_vault_tag(tenant_id);


ALTER TABLE scoped_vault_label
    ADD COLUMN tenant_id TEXT,
    ADD COLUMN is_live BOOLEAN,
    ADD CONSTRAINT fk_scoped_vault_label_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX scoped_vault_label_tenant_id ON scoped_vault_label(tenant_id);