ALTER TABLE vault_dr_manifest
  ADD COLUMN seqno BIGINT;

-- Backfill added after migration already applied in prod to fix tests:
UPDATE
	vault_dr_manifest vdrm
SET
	seqno = svv.seqno
FROM
	scoped_vault_version svv
WHERE
	vdrm.scoped_vault_version_id = svv.id
	AND vdrm.seqno IS NULL;

ALTER TABLE vault_dr_manifest
	ALTER COLUMN seqno SET NOT NULL;

CREATE INDEX
	vault_dr_manifest_config_id_seqno
	ON vault_dr_manifest(config_id, seqno);
