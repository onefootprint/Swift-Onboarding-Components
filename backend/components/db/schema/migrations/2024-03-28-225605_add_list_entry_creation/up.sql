CREATE TABLE list_entry_creation (
    id text PRIMARY KEY DEFAULT prefixed_uid('lec_'),
	created_at TIMESTAMPTZ NOT NULL,
    created_seqno BIGINT NOT NULL,
    _created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    _updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    list_id TEXT NOT NULL,
    actor JSONB NOT NULL,

    CONSTRAINT fk_list_entry_creation_list_id
       FOREIGN KEY(list_id) 
       REFERENCES list(id)
       DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS list_entry_creation_list_id ON list_entry_creation(list_id);
SELECT diesel_manage_updated_at('list_entry_creation');

ALTER TABLE list_entry 
    ADD COLUMN list_entry_creation_id TEXT,
    ADD CONSTRAINT fk_list_entry_list_entry_creation_id
       FOREIGN KEY(list_entry_creation_id) 
       REFERENCES list_entry_creation(id)
       DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX IF NOT EXISTS list_entry_list_entry_creation_id ON list_entry(list_entry_creation_id);