-- Step 1: backfill all the user workflows that only have a single business workflow that they could possibly
-- be attached to

WITH business_wfs_for_user AS (
    SELECT
        biz_wf.id as biz_wf_id,
        biz_wf.scoped_vault_id as sb_id,
        user_wf.id as user_wf_id,
        user_wf.scoped_vault_id as su_id,
        business_owner.id as bo_id,
        biz_wf.kind,
        biz_wf.created_at,
        user_wf.kind,
        user_wf.created_at
    FROM workflow biz_wf
    INNER JOIN scoped_vault sb
        ON biz_wf.scoped_vault_id = sb.id
    INNER JOIN business_owner
        ON business_owner.business_vault_id = sb.vault_id
    INNER JOIN scoped_vault su
        ON business_owner.user_vault_id = su.vault_id AND su.tenant_id = sb.tenant_id
    INNER JOIN workflow user_wf
        ON user_wf.scoped_vault_id = su.id AND user_wf.ob_configuration_id = biz_wf.ob_configuration_id
        -- try our best to select only the biz_wfs corresponding to the user_wf
        -- the primary BO's user workflow is actually created a few seconds before the business one
        AND user_wf.created_at > biz_wf.created_at - '5 seconds'::interval
        AND user_wf.kind = CASE
            WHEN biz_wf.kind = 'document' THEN 'document'
            WHEN biz_wf.kind = 'kyb' THEN 'kyc'
        END
    ORDER BY user_wf.scoped_vault_id, user_wf.ob_configuration_id
),
all_user_wfs_to_backfill AS (
    SELECT
        workflow.id
    FROM workflow
    INNER JOIN ob_configuration ON ob_configuration_id = ob_configuration.id
    INNER JOIN scoped_vault ON scoped_vault_id = scoped_vault.id
    INNER JOIN business_owner ON business_owner.user_vault_id = scoped_vault.vault_id
    WHERE workflow.kind = 'kyc' and ob_configuration.kind = 'kyb'
),
num_business_wfs_for_user_wf AS (
    SELECT
        all_user_wfs_to_backfill.id as user_wf_id,
        su_id,
        array_agg(sb_id),
        count(distinct biz_wf_id)
    FROM all_user_wfs_to_backfill
    LEFT JOIN business_wfs_for_user
        ON user_wf_id = all_user_wfs_to_backfill.id
    GROUP BY 1, 2
),
to_backfill AS (
    SELECT biz_wf_id, user_wf_id, bo_id
    FROM business_wfs_for_user
    -- Only backfill user workflows that have exactly 1 business workflow that they could be attached to
    WHERE
        user_wf_id IN (
            SELECT user_wf_id FROM num_business_wfs_for_user_wf WHERE count = 1
        )
        AND NOT EXISTS (
            SELECT * FROM business_workflow_link WHERE user_workflow_id = user_wf_id
        )
    ORDER BY user_wf_id ASC
    LIMIT 10000
)
INSERT INTO business_workflow_link(business_workflow_id, user_workflow_id, business_owner_id)
SELECT biz_wf_id, user_wf_id, bo_id
FROM to_backfill;


-- Step 2: attempt to match most other user workflows just based on time
WITH business_wfs_for_user AS (
    SELECT
        user_wf.id as user_wf_id,
        biz_wf.id as biz_wf_id,
        user_wf.kind,
        user_wf.scoped_vault_id as su_id,
        biz_wf.scoped_vault_id as sb_id,
        su.tenant_id,
        business_owner.id as bo_id,
        business_owner.kind as bo_kind,
        user_wf.status as user_status,
        biz_wf.status as biz_status,
        user_wf.created_at as user_created_at,
        biz_wf.created_at as biz_created_at,
        biz_wf.created_at - user_wf.created_at as delta
    FROM workflow biz_wf
    INNER JOIN scoped_vault sb
        ON biz_wf.scoped_vault_id = sb.id
    INNER JOIN business_owner
        ON business_owner.business_vault_id = sb.vault_id
    INNER JOIN scoped_vault su
        ON business_owner.user_vault_id = su.vault_id AND su.tenant_id = sb.tenant_id
    INNER JOIN workflow user_wf
        ON user_wf.scoped_vault_id = su.id AND user_wf.ob_configuration_id = biz_wf.ob_configuration_id
        -- try our best to select only the biz_wfs corresponding to the user_wf
        -- the primary BO's user workflow is actually created a few seconds before the business one
        -- AND user_wf.created_at > biz_wf.created_at
        AND user_wf.kind = CASE
            WHEN biz_wf.kind = 'document' THEN 'document'
            WHEN biz_wf.kind = 'kyb' THEN 'kyc'
        END
        AND biz_wf.created_at - user_wf.created_at < '1 second'::interval
        AND biz_wf.created_at - user_wf.created_at > '-1 second'::interval
        -- AND (biz_wf.deactivated_at IS NULL OR biz_wf.deactivated_at > user_wf.created_at)
    ORDER BY user_wf.scoped_vault_id, user_wf.ob_configuration_id
),
all_user_wfs_to_backfill AS (
    SELECT
        workflow.id
    FROM workflow
    INNER JOIN ob_configuration ON ob_configuration_id = ob_configuration.id
    INNER JOIN scoped_vault ON scoped_vault_id = scoped_vault.id
    INNER JOIN business_owner ON business_owner.user_vault_id = scoped_vault.vault_id
    WHERE workflow.kind = 'kyc' and ob_configuration.kind = 'kyb'
),
num_business_wfs_for_user_wf AS (
    SELECT
        all_user_wfs_to_backfill.id as user_wf_id,
        su_id,
        array_agg(sb_id),
        count(distinct biz_wf_id)
    FROM all_user_wfs_to_backfill
    LEFT JOIN business_wfs_for_user
        ON user_wf_id = all_user_wfs_to_backfill.id
    GROUP BY 1, 2
),
to_backfill AS (
    SELECT
        -- biz_wf_id, user_wf_id, bo_id
        *
    FROM business_wfs_for_user
    -- Only backfill user workflows that have exactly 1 business workflow that they could be attached to
    WHERE
        user_wf_id IN (
            SELECT user_wf_id FROM num_business_wfs_for_user_wf WHERE count = 1
        ) AND
        NOT EXISTS (
            SELECT * FROM business_workflow_link WHERE user_workflow_id = user_wf_id
        )
    ORDER BY su_id, user_wf_id ASC
)
INSERT INTO business_workflow_link(business_workflow_id, user_workflow_id, business_owner_id)
SELECT biz_wf_id, user_wf_id, bo_id
FROM to_backfill;;



-- SELECT *
-- from num_business_wfs_for_user_wf
-- inner join scoped_vault on scoped_vault.id = su_id
-- inner join tenant on tenant_id = tenant.id
-- WHERE count = 2 and tenant.is_demo_tenant = 'f' limit 5;


-- TODO some custom handling for the remaining user workflows that resolve to two different business workflows
-- Maybe for user workflows that resolve to two business workflows, pick the business workflow that was
-- active at the time the user workflow was made? That doesn't help when there are two separate businesses though.
-- Should only be for secondary BOs i think?
-- Maybe if there are two separate businesses, we just choose the biz_wf created closest to the user wf?
-- Only really need correct handling for non-demo tenants.
-- And ultimately don't reaaaaally need it for completed KYB workflows since they'll never be read... but would be nice to have for consistency