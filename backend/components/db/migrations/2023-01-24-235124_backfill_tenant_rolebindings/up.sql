-- Get the earliest created (tenant_user_id, email) for each email
CREATE TABLE new_tenant_user_id_for_email AS (
    SELECT u1.id, u1.email
    FROM tenant_user u1
        LEFT JOIN tenant_user u2
        ON u1.email = u2.email AND u1.created_at > u2.created_at
    WHERE u2.id IS NULL
);

-- Create one rolebinding for each existing tenant user, linking the new rolebindings for the same email to only one tenant_user
INSERT INTO tenant_rolebinding(tenant_user_id, tenant_role_id, tenant_id, last_login_at, deactivated_at, created_at)
SELECT 
    tu.id,
    old_tu.tenant_role_id,
    old_tu.tenant_id,
    old_tu.last_login_at,
    old_tu.deactivated_at,
    old_tu.created_at
FROM tenant_user old_tu
    INNER JOIN new_tenant_user_id_for_email tu
    ON old_tu.email = tu.email;

-- There are a few tables that have an `actor` column that encodes which user performed an action.
-- Since we deleted some duplicate tenant users, we have to backfill the actor with the user id
-- that was left behind





--
-- backfill annotation actor
--

-- Use an intermediate representation that records the email address that created the object
UPDATE annotation
SET actor = jsonb_build_object('data', jsonb_build_object('id', new_tenant_user_id_for_email.id), 'kind', 'tenant_user')
FROM tenant_user
INNER JOIN new_tenant_user_id_for_email
    ON tenant_user.email = new_tenant_user_id_for_email.email -- Grab the ID of the TenantUser with this email that will remain after the migration
WHERE
    annotation.actor->>'kind' = 'tenant_user' AND
    tenant_user.id = annotation.actor->'data'->>'id';


--
-- backfill onboarding_decision actor
--

UPDATE onboarding_decision
SET actor = jsonb_build_object('data', jsonb_build_object('id', new_tenant_user_id_for_email.id), 'kind', 'tenant_user')
FROM tenant_user
INNER JOIN new_tenant_user_id_for_email
    ON tenant_user.email = new_tenant_user_id_for_email.email -- Grab the ID of the TenantUser with this email that will remain after the migration
WHERE
    onboarding_decision.actor->>'kind' = 'tenant_user' AND
    tenant_user.id = onboarding_decision.actor->'data'->>'id';


--
-- backfill access_event principal
--

UPDATE access_event
SET principal = jsonb_build_object('data', jsonb_build_object('id', new_tenant_user_id_for_email.id), 'kind', 'tenant_user')
FROM tenant_user
INNER JOIN new_tenant_user_id_for_email
    ON tenant_user.email = new_tenant_user_id_for_email.email -- Grab the ID of the TenantUser with this email that will remain after the migration
WHERE
    access_event.principal->>'kind' = 'tenant_user' AND
    tenant_user.id = access_event.principal->'data'->>'id';



-- Finish up the migration


-- Remove the extra columns from tenant_user
ALTER TABLE tenant_user
    DROP COLUMN tenant_role_id,
    DROP COLUMN tenant_id,
    DROP COLUMN last_login_at,
    DROP COLUMN deactivated_at;

-- Delete duplicate tenant users
DELETE FROM tenant_user WHERE id NOT IN (
    SELECT id FROM new_tenant_user_id_for_email
);

DROP TABLE new_tenant_user_id_for_email;