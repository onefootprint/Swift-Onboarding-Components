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
            -- 2022-12-15
            -- this is just a temp thing since in local CI integration tests, 
            -- we roll back 4 migrations, then roll forward to check we are ok.
            -- However, 4 back from this migration is the PR where we add `lifetime_id` 
            -- to identity_document.

            -- So in CI, we:
            -- 1) Start the server, running all migrations
            -- 2) run integration tests, populating the DB
            -- 3) We _then_ run revert/migrate, but this migration relies on identity document to fill in nulls.
            --     Because in the revert, we drop `identity_document.lifetime_id`, we no longer have the data around
            --     To join, hence we get nulls when we do this backfill, then get errors when we set column constraints. E.g.  
            ---   https://github.com/onefootprint/monorepo/actions/runs/3705279036/usage

            -- TODO: should delete datalifetime rows/better backwards compat checks
            ELSE 'something_went_wrong' 
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