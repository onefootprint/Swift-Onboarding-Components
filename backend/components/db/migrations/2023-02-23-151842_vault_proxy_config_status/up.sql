ALTER TABLE proxy_config ADD COLUMN status TEXT NOT NULL DEFAULT 'enabled';
ALTER TABLE proxy_config ALTER COLUMN status DROP DEFAULT;