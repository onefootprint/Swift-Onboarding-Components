with updates as (
	select
		user_timeline.id,
		event as old_event,
		jsonb_set(event, '{data,ob_config_id}', to_jsonb(ob_configuration_id)) as new_event
	from user_timeline
	inner join workflow
		on workflow.id = event->'data'->>'workflow_id'
	where
		event->>'kind' = 'workflow_triggered'
		and event->'data'->>'workflow_id' is not null
	and event->'data'->>'ob_config_id' is null
)
update user_timeline set event = new_event
from updates
where user_timeline.id = updates.id;