ALTER TABLE access_event
    ALTER COLUMN tenant_id DROP NOT NULL,
    ALTER COLUMN is_live DROP NOT NULL,
    DROP CONSTRAINT fk_access_event_tenant_id;

DROP INDEX access_event_tenant_id_is_live_ordering_id;