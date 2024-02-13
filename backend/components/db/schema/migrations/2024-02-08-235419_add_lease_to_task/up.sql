ALTER TABLE task 
    ADD COLUMN max_lease_duration_s INT, 
    ADD COLUMN last_leased_at TIMESTAMPTZ;