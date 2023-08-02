
CREATE TABLE task_execution (
    id text PRIMARY KEY DEFAULT prefixed_uid('task_exec_'),
    created_at TIMESTAMPTZ NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    task_id TEXT NOT NULL,
    attempt_num INTEGER NOT NULL,
    error TEXT,
    new_status TEXT,

    CONSTRAINT fk_task_execution_task_id
        FOREIGN KEY (task_id)
        REFERENCES task(id)
        DEFERRABLE INITIALLY DEFERRED

);
SELECT diesel_manage_updated_at('task_execution');
CREATE INDEX IF NOT EXISTS task_execution_task_id ON task_execution(task_id);
