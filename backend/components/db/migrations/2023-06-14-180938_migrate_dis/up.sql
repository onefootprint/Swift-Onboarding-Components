UPDATE data_lifetime
SET kind = CASE
    WHEN kind ilike 'card.%.expiration.month' THEN REPLACE(kind, 'expiration.month', 'expiration_month')
    WHEN kind ilike 'card.%.expiration.year' THEN REPLACE(kind, 'expiration.year', 'expiration_year')
    WHEN kind ilike 'card.%.number.last4' THEN REPLACE(kind, 'number.last4', 'number_last4')
    ELSE kind
END
WHERE kind ilike 'card.%';

UPDATE vault_data
SET kind = CASE
    WHEN kind ilike 'card.%.expiration.month' THEN REPLACE(kind, 'expiration.month', 'expiration_month')
    WHEN kind ilike 'card.%.expiration.year' THEN REPLACE(kind, 'expiration.year', 'expiration_year')
    WHEN kind ilike 'card.%.number.last4' THEN REPLACE(kind, 'number.last4', 'number_last4')
    ELSE kind
END
WHERE kind ilike 'card.%';

UPDATE access_event
SET targets = (
    SELECT array_agg(CASE
        WHEN target ilike 'card.%.expiration.month' THEN REPLACE(target, 'expiration.month', 'expiration_month')
        WHEN target ilike 'card.%.expiration.year' THEN REPLACE(target, 'expiration.year', 'expiration_year')
        WHEN target ilike 'card.%.number.last4' THEN REPLACE(target, 'number.last4', 'number_last4')
        ELSE target
    END)
    FROM unnest(targets) as target
)
WHERE
    kind = 'decrypt' AND
    (SELECT TRUE FROM UNNEST(targets) AS target WHERE target ilike 'card.%' LIMIT 1);