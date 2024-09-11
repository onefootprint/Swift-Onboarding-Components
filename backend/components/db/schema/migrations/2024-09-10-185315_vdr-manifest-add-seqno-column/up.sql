ALTER TABLE vault_dr_manifest
  ADD COLUMN seqno BIGINT NOT NULL;

CREATE INDEX
	vault_dr_manifest_config_id_seqno
	ON vault_dr_manifest(config_id, seqno);
