UPDATE access_event
SET targets = (
    SELECT array_agg(CASE
        WHEN target ILIKE 'card.%.exp_month' THEN REPLACE(target, 'exp_month', 'expiration_month')
        WHEN target ILIKE 'card.%.exp_year' THEN REPLACE(target, 'exp_year', 'expiration_year')
        WHEN target ILIKE 'card.%.expiration.month' THEN REPLACE(target, 'expiration.month', 'expiration_month')
        WHEN target ILIKE 'card.%.expiration.year' THEN REPLACE(target, 'expiration.year', 'expiration_year')
        WHEN target ILIKE 'card.%.number.last4' THEN REPLACE(target, 'number.last4', 'number_last4')
        WHEN target ILIKE 'card.%.last4' THEN REPLACE(target, '.last4', '.number_last4')
        ELSE target
    END)
    FROM unnest(targets) as target
)
WHERE
    (SELECT TRUE FROM UNNEST(targets) AS target WHERE target ilike 'card.%.exp_%' or target ilike 'card.%.expiration.%' or target ilike 'card.%.last4' LIMIT 1);