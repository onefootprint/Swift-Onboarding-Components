SELECT 1;

/*
UPDATE audit_event
	SET list_id = list_entry.list_id
	FROM list_entry
	WHERE list_entry.id = audit_event.list_entry_id
		AND audit_event.list_entry_id IS NOT NULL
		AND audit_event.list_id IS NULL;

UPDATE audit_event
	SET list_id = list_entry_creation.list_id
	FROM list_entry_creation
	WHERE list_entry_creation.id = audit_event.list_entry_creation_id
		AND audit_event.list_entry_creation_id IS NOT NULL
		AND audit_event.list_id IS NULL;
*/
