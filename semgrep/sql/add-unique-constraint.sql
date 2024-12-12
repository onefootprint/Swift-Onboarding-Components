# ruleid: add-unique-constraint
ALTER TABLE foo ADD UNIQUE (bar);

# ruleid: add-unique-constraint
ALTER TABLE foo
  ADD CONSTRAINT uniq_bar UNIQUE (bar, baz);

# ok: add-unique-constraint
ALTER TABLE foo
  ADD CONSTRAINT uniq_bar UNIQUE USING INDEX idx_foo_bar;
