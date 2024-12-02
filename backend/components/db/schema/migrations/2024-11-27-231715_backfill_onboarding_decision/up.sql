WITH events AS (
    SELECT
        DISTINCT ON(user_obd.id)
        user_obd.id as obd_id, user_obd.seqno, user_obd.created_at, su.id as su_id, user_obd.status, bo.business_vault_id as bv_id, sb.id as sb_id, sb.vault_id as biz_vault_id
    FROM onboarding_decision user_obd
    INNER JOIN workflow user_wf ON user_obd.workflow_id = user_wf.id
    INNER JOIN scoped_vault su ON user_wf.scoped_vault_id = su.id
    INNER JOIN business_workflow_link bwfl ON user_workflow_id = user_wf.id
    INNER JOIN workflow biz_wf ON bwfl.business_workflow_id = biz_wf.id AND biz_wf.created_at < user_obd.created_at
    INNER JOIN scoped_vault sb ON biz_wf.scoped_vault_id = sb.id
    INNER JOIN business_owner bo ON bwfl.business_owner_id = bo.id
    WHERE user_obd.status != 'step_up'
    ORDER BY user_obd.id, biz_wf.created_at DESC
),
to_insert AS (
    SELECT
        sb_id,
        json_build_object('kind', 'business_owner_completed_kyc', 'data', json_build_object('onboarding_decision_id', obd_id)),
        created_at,
        biz_vault_id,
        'business_owner_completed_kyc',
        true,
        seqno
    FROM events
    WHERE NOT EXISTS (
        SELECT *
        FROM user_timeline ut
        WHERE ut.scoped_vault_id = events.sb_id
        AND ut.event_kind = 'business_owner_completed_kyc'
        AND ut.event->'data'->>'onboarding_decision_id' = events.obd_id
    )
)
INSERT INTO user_timeline (scoped_vault_id, event, timestamp, vault_id, event_kind, is_backfilled, seqno)
SELECT * FROM to_insert;