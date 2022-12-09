ALTER TABLE data_lifetime
  ADD COLUMN kind TEXT;

-- Derive our dl kinds
CREATE VIEW all_kinds AS (
    SELECT 
        CASE 
            WHEN uvd.id IS NOT NULL THEN uvd.kind
            WHEN p.id IS NOT NULL THEN 'phone_number'
            WHEN e.id IS NOT NULL THEN 'email'
            WHEN i.id IS NOT NULL THEN 'identity_document'
        END as dl_kind,
        dl.id as dl_id
    FROM data_lifetime dl
    LEFT JOIN user_vault_data uvd ON dl.id = uvd.lifetime_id
    LEFT JOIN phone_number p ON dl.id = p.lifetime_id
    LEFT JOIN email e ON dl.id = e.lifetime_id
    LEFT JOIN identity_document i ON dl.id = i.lifetime_id
);

-- update
UPDATE 
    data_lifetime dl
SET 
    kind = dl_kind
FROM 
    all_kinds
WHERE 
    dl.id = all_kinds.dl_id;

-- clean up the house
DROP VIEW all_kinds;

-- set not null
ALTER TABLE data_lifetime
  ALTER COLUMN kind SET NOT NULL;