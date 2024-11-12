WITH new_playbook AS (
	INSERT INTO playbook (id, key, tenant_id, is_live, status)
	    SELECT
          REPLACE(ob_configuration.id, 'ob_config_id_', 'pb_') AS id,
          ob_configuration.key,
          ob_configuration.tenant_id,
          ob_configuration.is_live,
          ob_configuration.status
		    FROM ob_configuration
		    WHERE playbook_id IS NULL
-- Batch when manually applying:
--		    LIMIT 1000
      RETURNING playbook.id, playbook.key, playbook.tenant_id, playbook.is_live, playbook.status
)
UPDATE ob_configuration
SET playbook_id = new_playbook.id
FROM new_playbook
WHERE ob_configuration.id = REPLACE(new_playbook.id, 'pb_', 'ob_config_id_');
