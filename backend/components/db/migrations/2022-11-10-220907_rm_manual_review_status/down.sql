-- set onboarding.status back to 'manual_review' for any outstanding manual_review rows
UPDATE onboarding
SET status = 'manual_review'
FROM manual_review
WHERE onboarding.id = manual_review.onboarding_id AND manual_review.completed_at IS NULL;

DELETE FROM manual_review where completed_at IS NULL;