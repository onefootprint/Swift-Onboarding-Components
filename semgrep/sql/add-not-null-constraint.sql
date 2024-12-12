# ruleid: add-not-null-constraint
ALTER TABLE foo ALTER COLUMN bar SET NOT NULL;

# ruleid: add-not-null-constraint
ALTER TABLE foo
  ALTER COLUMN bar SET NOT NULL;

# ok: add-not-null-constraint
ALTER TABLE foo ADD CONSTRAINT bar_not_null CHECK (bar IS NOT NULL) NOT VALID;
