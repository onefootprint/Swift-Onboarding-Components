-- Run this manually in dev/prod, batched by scoped_vault.id prefix range.

INSERT INTO scoped_vault_version (scoped_vault_id, seqno, version)
(
  WITH
  sv_ids AS (
    -- Lock the scoped vaults we're operating on.
    SELECT id FROM scoped_vault
    -- Batch by scoped_vault_id prefix.
    -- Make the bins small enough that each bin's backfill run in <= 500ms.
    -- WHERE id LIKE 'su_541%'
    FOR NO KEY UPDATE
  ),
  sv_seqnos AS (
    (
      SELECT distinct scoped_vault_id, created_seqno AS seqno FROM data_lifetime
      WHERE exists (SELECT * FROM sv_ids WHERE sv_ids.id = scoped_vault_id)
    )
    UNION
    (
      SELECT distinct scoped_vault_id, deactivated_seqno AS seqno FROM data_lifetime
      WHERE deactivated_seqno IS NOT NULL AND exists (SELECT * FROM sv_ids WHERE sv_ids.id = scoped_vault_id)
    )
  ),
  insert_values AS (
    SELECT scoped_vault_id, seqno, dense_rank() over (
      PARTITION BY scoped_vault_id
      ORDER BY seqno
    ) AS version FROM sv_seqnos
  )
  SELECT * FROM insert_values WHERE not exists (
    SELECT * FROM scoped_vault_version
    WHERE scoped_vault_version.scoped_vault_id = insert_values.scoped_vault_id
    AND scoped_vault_version.seqno = insert_values.seqno
    AND scoped_vault_version.version = insert_values.version
  )
);
