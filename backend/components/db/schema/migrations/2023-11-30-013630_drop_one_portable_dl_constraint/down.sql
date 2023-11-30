-- NOTE this has to normally happen CONCURRENTLY...  can't do that with diesel, so i dropped them manually in dev and prod
CREATE UNIQUE INDEX IF NOT EXISTS unique_portable_data_lifetime_per_user_vault ON data_lifetime(kind, vault_id)
WHERE
    deactivated_seqno IS NULL AND
    portablized_seqno IS NOT NULL AND
    -- id documents are not yet unique
    NOT starts_with(kind, 'id_document.');