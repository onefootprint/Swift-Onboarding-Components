# ruleid: create-index
CREATE INDEX foo ON bar (baz);

# ruleid: create-index
CREATE INDEX
foo ON bar (baz);

# ok: create-index
CREATE INDEX CONCURRENTLY foo ON bar (baz);

# ok: create-index
CREATE INDEX
   CONCURRENTLY foo ON bar (baz);
