# ruleid: add-exclude-constraint
ALTER TABLE foo ADD EXCLUDE USING gist (bar WITH &&);

# ruleid: add-exclude-constraint
ALTER TABLE foo
  ADD CONSTRAINT excl_bar
  EXCLUDE USING btree (bar WITH =);

# ruleid: add-exclude-constraint
ALTER TABLE foo ADD EXCLUDE USING gist
  (period WITH &&, group_id WITH =);
