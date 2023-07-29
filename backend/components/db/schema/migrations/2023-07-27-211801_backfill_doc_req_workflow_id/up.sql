-- select vault.kind, count(*) from document_request inner join scoped_vault on scoped_vault_id = scoped_vault.id inner join vault on vault_id = vault.id where workflow_id is null group by 1;
-- select scoped_vault_id, count(*) from workflow where scoped_vault_id in (select scoped_vault_id from document_request where workflow_id is null) group by 1 having count(*) > 1;
-- SELECT count(*) from document_request inner join workflow on workflow.id = workflow_id where document_request.scoped_vault_id != workflow.scoped_vault_id;

-- Every document request that doesn't have a workflow is for a user that only has one workflow,
-- so we can just backfill with the workflow belonging to that scoped vault

UPDATE document_request
SET workflow_id = workflow.id
FROM workflow
WHERE
    document_request.scoped_vault_id = workflow.scoped_vault_id AND
    document_request.workflow_id IS NULL;


ALTER TABLE document_request ALTER COLUMN workflow_id SET NOT NULL;