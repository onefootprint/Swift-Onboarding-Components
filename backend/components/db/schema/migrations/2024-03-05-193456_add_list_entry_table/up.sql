CREATE TABLE list_entry (
    id text PRIMARY KEY DEFAULT prefixed_uid('lst_'),
	created_at TIMESTAMPTZ NOT NULL,
    created_seqno BIGINT NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    deactivated_seqno BIGINT,

    list_id TEXT NOT NULL,
    actor JSONB NOT NULL,
    e_data BYTEA NOT NULL,

    CONSTRAINT fk_list_entry_list_id
       FOREIGN KEY(list_id) 
       REFERENCES list(id)
       DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS list_entry_list_id ON list_entry(list_id);
SELECT diesel_manage_updated_at('list_entry');
