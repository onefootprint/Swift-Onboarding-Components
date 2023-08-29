ALTER TABLE workflow ADD COLUMN completed_at TIMESTAMPTZ;

UPDATE workflow
SET completed_at = workflow_event.created_at
FROM workflow_event
WHERE workflow_event.workflow_id = workflow.id AND workflow_event.to_state in ('kyc.complete', 'alpaca_kyc.complete', 'document.complete', 'kyb.complete');