UPDATE verification_request vreq
SET scoped_user_id = ob.scoped_user_id
FROM onboarding ob
WHERE vreq.onboarding_id = ob.id;
COMMIT;
BEGIN;
ALTER TABLE verification_request ALTER COLUMN scoped_user_id SET NOT NULL;
