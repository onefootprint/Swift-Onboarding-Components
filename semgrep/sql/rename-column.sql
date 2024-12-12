 # ruleid: rename-column
ALTER TABLE foo RENAME COLUMN bar TO baz;

# ruleid: rename-column
ALTER TABLE foo
  RENAME COLUMN bar TO baz;

# ruleid: rename-column
ALTER TABLE schema.foo RENAME COLUMN bar TO baz;
