-- Portable, active data should be unique per user_vault_id.
CREATE UNIQUE INDEX IF NOT EXISTS unique_portable_data_lifetime_per_user_vault ON data_lifetime(kind, user_vault_id)
WHERE
    deactivated_seqno IS NULL AND
    portablized_seqno IS NOT NULL AND
    -- id documents are not yet unique
    NOT starts_with(kind, 'id_document.');

-- Speculative, active data should be unique per scoped_user_id.
CREATE UNIQUE INDEX IF NOT EXISTS unique_speculative_data_lifetime_per_scoped_user ON data_lifetime(kind, scoped_user_id)
WHERE
    deactivated_seqno IS NULL AND
    portablized_seqno IS NULL AND
    scoped_user_id IS NOT NULL AND
    -- id documents are not yet unique
    NOT starts_with(kind, 'id_document.');