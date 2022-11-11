-- Create manual_review rows for all onboardings that are currently in the 'manual_review' state
INSERT INTO manual_review(timestamp, onboarding_id)
SELECT current_timestamp, onboarding.id
    FROM onboarding WHERE onboarding.status = 'manual_review';

UPDATE onboarding SET status='failed' WHERE status='manual_review';