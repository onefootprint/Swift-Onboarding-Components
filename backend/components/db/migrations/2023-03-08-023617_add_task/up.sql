
CREATE TABLE task (
    id text PRIMARY KEY DEFAULT prefixed_uid('task_'),
    created_at TIMESTAMP NOT NULL,
    _created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    scheduled_for TIMESTAMP NOT NULL,
    task_data JSONB NOT NULL,
    status TEXT NOT NULL,
    num_attempts INTEGER NOT NULL
);
SELECT diesel_manage_updated_at('task');
CREATE INDEX IF NOT EXISTS task_status_scheduled_for_index ON task(status, scheduled_for);
