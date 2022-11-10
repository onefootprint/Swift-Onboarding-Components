UPDATE onboarding SET status = 'new' WHERE idv_reqs_initiated = FALSE;

ALTER TABLE onboarding DROP COLUMN idv_reqs_initiated;