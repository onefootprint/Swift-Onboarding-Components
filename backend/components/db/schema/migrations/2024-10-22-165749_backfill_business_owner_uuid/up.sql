UPDATE business_owner
SET uuid = gen_random_uuid()
WHERE uuid IS NULL;