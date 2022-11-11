-- This was previously a denormalized column that just represented the status on the latest decision.
-- Now we can just get rid of this, nothing to backfill
ALTER TABLE onboarding DROP column status;