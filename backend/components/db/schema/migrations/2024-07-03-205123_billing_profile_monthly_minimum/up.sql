UPDATE billing_profile
SET prices = jsonb_set(prices, array['monthly_minimum_on_identity']::text[], to_jsonb(monthly_minimum), true)
WHERE monthly_minimum IS NOT NULL;