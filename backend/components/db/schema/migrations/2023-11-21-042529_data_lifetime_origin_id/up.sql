ALTER TABLE data_lifetime
  ADD COLUMN origin_id TEXT,
  ADD CONSTRAINT fk_data_lifetime_origin_id
    FOREIGN KEY(origin_id) 
        REFERENCES data_lifetime(id)
        DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX IF NOT EXISTS data_lifetime_origin_id ON data_lifetime(origin_id);