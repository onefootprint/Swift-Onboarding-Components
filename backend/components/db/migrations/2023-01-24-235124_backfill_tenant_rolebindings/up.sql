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


-- This is tricky.... we have some table with an `actor` column that encodes which user performed an action.
-- Since we deleted some tenant users, we would normally need to replace those rows with the new user id.
-- I manually checked that right now, the only `actor`s in the DB are single tenant users