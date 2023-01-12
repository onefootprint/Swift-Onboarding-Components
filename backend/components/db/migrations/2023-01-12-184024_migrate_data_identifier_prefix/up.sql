UPDATE access_event
SET targets = (
    SELECT array_agg(REPLACE(REPLACE(target, 'identity.', 'id.'), 'identity_', 'id_'))
    FROM unnest(targets) as target
);
