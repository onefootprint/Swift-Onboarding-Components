# ruleid: drop-column
ALTER TABLE foo DROP
  COLUMN bar;

# ok: drop-column
ALTER TABLE foo DROP COLUMN IF EXISTS bar;
