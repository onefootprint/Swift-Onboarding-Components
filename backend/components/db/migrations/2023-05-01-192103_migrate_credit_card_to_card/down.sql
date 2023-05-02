UPDATE vault_data SET kind = REPLACE(kind, 'card.', 'credit_card.') WHERE kind ILIKE 'card.%';
UPDATE data_lifetime SET kind = REPLACE(kind, 'card.', 'credit_card.') WHERE kind ILIKE 'card.%';

UPDATE access_event
SET targets = (
    SELECT array_agg(REPLACE(target, 'card.', 'credit_card.')) 
    FROM unnest(targets) as target
)
WHERE array_to_string(targets, ',') ilike '%card.%';