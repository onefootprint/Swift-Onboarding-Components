UPDATE access_event
SET targets = (
    SELECT array_agg(REPLACE(REPLACE(target, 'id.', 'identity.'), 'id_', 'identity_'))
    FROM unnest(targets) as target
);