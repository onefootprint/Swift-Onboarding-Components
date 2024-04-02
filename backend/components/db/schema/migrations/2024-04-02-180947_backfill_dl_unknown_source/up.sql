WITH dls_to_update AS (
  SELECT data_lifetime.id, is_created_via_api
  FROM data_lifetime
  INNER JOIN vault ON data_lifetime.vault_id = vault.id
  WHERE source = 'unknown'
  ORDER BY data_lifetime.id
)
UPDATE data_lifetime
SET source = CASE
	WHEN is_created_via_api THEN 'tenant'
	ELSE 'hosted'
END
FROM dls_to_update
WHERE data_lifetime.id = dls_to_update.id;