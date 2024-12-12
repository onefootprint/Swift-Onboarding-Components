# ruleid: add-foreign-key
ALTER TABLE foo ADD CONSTRAINT fk_foo_bar_id FOREIGN KEY (bar_id) REFERENCES bar(id);

# ruleid: add-foreign-key
ALTER TABLE foo
  ADD CONSTRAINT fk_bar ADD CONSTRAINT fk_foo_bar_id FOREIGN KEY (bar_id) REFERENCES bar(id);

# ok: add-foreign-key
ALTER TABLE foo ADD CONSTRAINT fk_foo_bar_id FOREIGN KEY (bar_id) REFERENCES bar(id) NOT VALID;

# ok: add-foreign-key
ALTER TABLE foo
  ADD CONSTRAINT fk_foo_bar_id
  FOREIGN KEY (bar_id)
  REFERENCES bar(id) NOT VALID;

# ok: add-foreign-key
ALTER TABLE foo
  DROP CONSTRAINT fk_bar_bar_id;
