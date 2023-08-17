DROP VIEW IF EXISTS vendor_calls_view;

-- No longer needed! We have a backup if needed in backup_onboardings_08_15_. This is missing ~1k
-- onboardings, but those 1k were all created after dropping every useful piece of information on onboarding
DROP TABLE IF EXISTS onboarding;

-- Cleaning up my old mess :) a backup table named backup_onboardings_08_15_ will still exist in prod
DROP TABLE IF EXISTS backup_onboardings_08_15;