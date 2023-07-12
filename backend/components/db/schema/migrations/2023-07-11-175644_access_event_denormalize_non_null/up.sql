-- Disable the updated_at trigger, just makes this operation even more slow
ALTER TABLE access_event DISABLE TRIGGER USER;

UPDATE access_event
SET
    tenant_id = scoped_vault.tenant_id,
    is_live = scoped_vault.is_live,
    _updated_at = current_timestamp
FROM scoped_vault
WHERE scoped_vault.id = access_event.scoped_vault_id AND access_event.tenant_id IS NULL;

ALTER TABLE access_event ENABLE TRIGGER USER;

CREATE INDEX IF NOT EXISTS access_event_tenant_id_is_live_ordering_id ON access_event(tenant_id, is_live, ordering_id);

ALTER TABLE access_event
    ALTER COLUMN tenant_id SET NOT NULL,
    ALTER COLUMN is_live SET NOT NULL,
    ADD CONSTRAINT fk_access_event_tenant_id
        FOREIGN KEY(tenant_id) 
        REFERENCES tenant(id)
        DEFERRABLE INITIALLY DEFERRED;