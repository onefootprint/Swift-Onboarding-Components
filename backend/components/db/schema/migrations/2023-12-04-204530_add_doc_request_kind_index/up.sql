-- RUN THIS IN PSQL SHELL CONCURRENTLY
CREATE UNIQUE INDEX IF NOT EXISTS document_request_workflow_kind ON document_request(workflow_id, kind) WHERE workflow_id IS NOT NULL;
