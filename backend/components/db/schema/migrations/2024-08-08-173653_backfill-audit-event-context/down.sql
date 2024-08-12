UPDATE audit_event
SET metadata = audit_event.metadata #- '{"data", "context"}'
WHERE
	-- Batch the update using this filter.
	-- audit_event.id >= 'ae_00' AND audit_event.id < 'ae_01' AND
	audit_event.name = 'decrypt_user_data';
