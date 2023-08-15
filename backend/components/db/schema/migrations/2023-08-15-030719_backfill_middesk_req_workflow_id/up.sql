SET CONSTRAINTS ALL IMMEDIATE;

UPDATE middesk_request
SET workflow_id = decision_intent.workflow_id
FROM decision_intent
WHERE middesk_request.decision_intent_id = decision_intent.id;

ALTER TABLE middesk_request
    ALTER COLUMN workflow_id SET NOT NULL;
