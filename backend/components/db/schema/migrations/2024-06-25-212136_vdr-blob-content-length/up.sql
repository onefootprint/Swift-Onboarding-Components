ALTER TABLE vault_dr_blob ADD COLUMN content_length_bytes BIGINT NOT NULL;
ALTER TABLE vault_dr_blob DROP COLUMN IF EXISTS content_md5;
ALTER TABLE vault_dr_blob RENAME COLUMN dl_created_at_seqno TO dl_created_seqno;
ALTER INDEX vault_dr_blob_dl_created_at_seqno RENAME TO vault_dr_blob_dl_created_seqno;
