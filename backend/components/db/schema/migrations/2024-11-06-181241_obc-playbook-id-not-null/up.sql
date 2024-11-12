-- Run manually:

ALTER TABLE ob_configuration
	ADD CONSTRAINT ob_configuration_playbook_id_not_null
	CHECK (playbook_id IS NOT NULL) NOT VALID;

ALTER TABLE ob_configuration
	VALIDATE CONSTRAINT ob_configuration_playbook_id_not_null;

ALTER TABLE ob_configuration
	ALTER playbook_id SET NOT NULL;

ALTER TABLE ob_configuration
	DROP CONSTRAINT ob_configuration_playbook_id_not_null;

-- INSERT INTO __diesel_schema_migrations(version) VALUES('20241106181241') RETURNING *;

