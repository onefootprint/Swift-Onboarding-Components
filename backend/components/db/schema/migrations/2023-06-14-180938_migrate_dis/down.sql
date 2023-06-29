UPDATE data_lifetime
SET kind = CASE
    WHEN kind ilike 'card.%.expiration_month' THEN REPLACE(kind, 'expiration_month', 'expiration.month')
    WHEN kind ilike 'card.%.expiration_year' THEN REPLACE(kind, 'expiration_year', 'expiration.year')
    WHEN kind ilike 'card.%.number_last4' THEN REPLACE(kind, 'number_last4', 'number.last4')
    ELSE kind
END
WHERE kind ilike 'card.%';

UPDATE vault_data
SET kind = CASE
    WHEN kind ilike 'card.%.expiration_month' THEN REPLACE(kind, 'expiration_month', 'expiration.month')
    WHEN kind ilike 'card.%.expiration_year' THEN REPLACE(kind, 'expiration_year', 'expiration.year')
    WHEN kind ilike 'card.%.number_last4' THEN REPLACE(kind, 'number_last4', 'number.last4')
    ELSE kind
END
WHERE kind ilike 'card.%';

UPDATE access_event
SET targets = (
    SELECT array_agg(CASE
        WHEN target ilike 'card.%.expiration_month' THEN REPLACE(target, 'expiration_month', 'expiration.month')
        WHEN target ilike 'card.%.expiration_year' THEN REPLACE(target, 'expiration_year', 'expiration.year')
        WHEN target ilike 'card.%.number_last4' THEN REPLACE(target, 'number_last4', 'number.last4')
        ELSE target
    END)
    FROM unnest(targets) as target
)
WHERE
    kind = 'decrypt' AND
    (SELECT TRUE FROM UNNEST(targets) AS target WHERE target ilike 'card.%' LIMIT 1);