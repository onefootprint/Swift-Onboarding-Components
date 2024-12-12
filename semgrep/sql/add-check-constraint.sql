# ruleid: add-check-constraint
ALTER TABLE foo ADD CONSTRAINT check_bar CHECK (bar > 0);

# ruleid: add-check-constraint
ALTER TABLE foo
  ADD CONSTRAINT check_bar CHECK (bar > 0);

# ok: add-check-constraint
ALTER TABLE foo ADD CONSTRAINT check_bar CHECK (bar > 0) NOT VALID;

# ok: add-check-constraint
ALTER TABLE foo
  ADD CONSTRAINT check_bar
  CHECK (bar > 0) NOT VALID;
