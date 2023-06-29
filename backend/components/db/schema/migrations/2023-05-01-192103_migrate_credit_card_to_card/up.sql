UPDATE access_event
SET targets = (
    SELECT array_agg(REPLACE(target, 'credit_card.', 'card.')) 
    FROM unnest(targets) as target    
)
WHERE array_to_string(targets, ',') ilike '%credit_card.%';

UPDATE data_lifetime SET kind = REPLACE(kind, 'credit_card.', 'card.') WHERE kind ILIKE 'credit_card.%';
UPDATE vault_data SET kind = REPLACE(kind, 'credit_card.', 'card.') WHERE kind ILIKE 'credit_card.%';