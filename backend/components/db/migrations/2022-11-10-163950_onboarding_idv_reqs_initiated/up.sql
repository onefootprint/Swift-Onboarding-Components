ALTER TABLE onboarding ADD COLUMN idv_reqs_initiated BOOL NOT NULL DEFAULT FALSE;

-- Every onboarding past the `new` state has had IDV reqs initiated
UPDATE onboarding SET idv_reqs_initiated = TRUE WHERE status != 'new';
-- We are getting rid of the `new` status. Should eventually get rid of `processing` too.
UPDATE onboarding SET status = 'processing' WHERE status = 'new';

ALTER TABLE onboarding ALTER COLUMN idv_reqs_initiated DROP DEFAULT;