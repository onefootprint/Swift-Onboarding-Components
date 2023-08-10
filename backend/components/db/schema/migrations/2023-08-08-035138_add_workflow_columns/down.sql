ALTER TABLE workflow
    DROP COLUMN status,
    DROP COLUMN ob_configuration_id,
    DROP COLUMN insight_event_id,
    DROP COLUMN authorized_at;

ALTER TABLE scoped_vault DROP COLUMN status;