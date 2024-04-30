-- not used initially so we can backfill just biz rule instances and add checks to creation/edit paths
-- so that you cannot mix kinds for a single rule_id
ALTER TABLE rule_instance ADD COLUMN kind TEXT NOT NULL DEFAULT 'person';