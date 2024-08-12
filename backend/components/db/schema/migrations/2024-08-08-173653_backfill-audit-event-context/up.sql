UPDATE audit_event
SET metadata = jsonb_set(
	audit_event.metadata,
	'{"data", "context"}',
	to_jsonb((
		SELECT COALESCE(access_event.purpose, default_val.purpose) AS purpose
		FROM
			(SELECT 'unknown' AS purpose) AS default_val
			LEFT JOIN access_event ON access_event.id = audit_event.id
	))
)
WHERE
	-- Batch the update using this filter.
	-- audit_event.id >= 'ae_00' AND audit_event.id < 'ae_01' AND
	audit_event.name = 'decrypt_user_data'
	AND audit_event.metadata->'data'->>'context' IS NULL;
