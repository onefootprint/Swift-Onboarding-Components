CREATE INDEX CONCURRENTLY
	vault_dr_manifest_config_id_seqno
	ON vault_dr_manifest(config_id, seqno);
