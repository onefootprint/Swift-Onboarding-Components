ALTER TABLE list_entry DROP COLUMN list_entry_creation_id;
DROP INDEX IF EXISTS list_entry_list_entry_creation_list_id;
DROP TABLE IF EXISTS list_entry_creation;