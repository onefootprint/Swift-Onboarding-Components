with updates as (
	select
		id,
		scoped_vault_id,
		config as old_config,
		jsonb_build_object('kind', 'onboard', 'data', jsonb_build_object('playbook_id', ob_configuration_id)) as new_config
	from workflow_request
	where config->>'kind' = 'redo_kyc'
)
update workflow_request
set config = new_config
from updates 
where workflow_request.id = updates.id;