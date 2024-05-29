use super::fixtures::ob_configuration::ObConfigurationOpts;
use crate::models::onboarding_decision::NewDecisionArgs;
use crate::models::task::{
    NewTask,
    Task,
};
use crate::models::watchlist_check::{
    NewWatchlistCheck,
    WatchlistCheck,
};
use crate::models::workflow::{
    Workflow,
    WorkflowUpdate,
};
use crate::test_helpers::assert_have_same_elements;
use crate::tests::fixtures;
use crate::tests::prelude::*;
use chrono::{
    DateTime,
    Duration,
    Utc,
};
use macros::db_test;
use newtypes::{
    DataLifetimeSeqno,
    DbActor,
    DecisionStatus,
    EnhancedAmlOption,
    ScopedVaultId,
    TaskData,
    TaskStatus,
    TenantId,
    VaultKind,
    WatchlistCheckArgs,
    WatchlistCheckStatus,
    WatchlistCheckStatusKind,
};

#[db_test]
fn test_watchlist_check(conn: &mut TestPgConn) {
    // SETUP
    let tenant = fixtures::tenant::create(conn);
    let tenant_id = tenant.id.clone();

    let tenant2 = fixtures::tenant::create(conn);
    let tenant2_id = tenant2.id.clone();

    let ten_days_ago = Utc::now() - Duration::days(10);
    let twenty_days_ago = Utc::now() - Duration::days(20);
    let forty_days_ago = Utc::now() - Duration::days(40);
    let fifty_days_ago = Utc::now() - Duration::days(50);

    // Legacy fractional cases
    let sv1 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(forty_days_ago),
        vec![],
        EnhancedAmlOption::No,
    );
    let _sv2 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(twenty_days_ago),
        vec![],
        EnhancedAmlOption::No,
    );
    let _sv3 = make_vault(
        conn,
        &tenant_id,
        false,
        true,
        Some(forty_days_ago),
        vec![],
        EnhancedAmlOption::No,
    );
    let _sv4 = make_vault(
        conn,
        &tenant_id,
        false,
        true,
        Some(twenty_days_ago),
        vec![],
        EnhancedAmlOption::No,
    );
    let sv5 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(forty_days_ago),
        vec![forty_days_ago],
        EnhancedAmlOption::No,
    );

    let _sv6 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(forty_days_ago),
        vec![twenty_days_ago],
        EnhancedAmlOption::No,
    );
    let _sv7 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(forty_days_ago),
        vec![ten_days_ago, twenty_days_ago, forty_days_ago],
        EnhancedAmlOption::No,
    );
    let _sv8 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(twenty_days_ago),
        vec![forty_days_ago, fifty_days_ago],
        EnhancedAmlOption::No,
    );
    let _sv9 = make_vault(
        conn,
        &tenant_id,
        true,
        false,
        None,
        vec![ten_days_ago, twenty_days_ago],
        EnhancedAmlOption::No,
    );
    let sv10 = make_vault(
        conn,
        &tenant_id,
        true,
        false,
        None,
        vec![forty_days_ago],
        EnhancedAmlOption::No,
    );
    let sv11 = make_vault(conn, &tenant_id, true, false, None, vec![], EnhancedAmlOption::No);

    // Enhanced AML cases
    let sv12 = make_vault(
        conn,
        &tenant2_id,
        true,
        true,
        Some(forty_days_ago),
        vec![],
        EnhancedAmlOption::Yes {
            ofac: false,
            pep: false,
            adverse_media: false,
            continuous_monitoring: true,
            adverse_media_lists: None,
        },
    );

    let _sv13 = make_vault(
        conn,
        &tenant2_id,
        false,
        true,
        Some(forty_days_ago),
        vec![],
        EnhancedAmlOption::Yes {
            ofac: false,
            pep: false,
            adverse_media: false,
            continuous_monitoring: true,
            adverse_media_lists: None,
        },
    );

    let sv14 = make_vault(
        conn,
        &tenant2_id,
        true,
        true,
        Some(forty_days_ago),
        vec![],
        EnhancedAmlOption::Yes {
            ofac: false,
            pep: false,
            adverse_media: false,
            continuous_monitoring: true,
            adverse_media_lists: None,
        },
    );

    let _sv15 = make_vault(
        conn,
        &tenant2_id,
        true,
        true,
        Some(twenty_days_ago),
        vec![forty_days_ago, fifty_days_ago],
        EnhancedAmlOption::Yes {
            ofac: false,
            pep: false,
            adverse_media: false,
            continuous_monitoring: true,
            adverse_media_lists: None,
        },
    );

    let _sv16 = make_vault(
        conn,
        &tenant2_id,
        true,
        true,
        Some(forty_days_ago),
        vec![],
        EnhancedAmlOption::Yes {
            ofac: false,
            pep: false,
            adverse_media: false,
            continuous_monitoring: false,
            adverse_media_lists: None,
        },
    );

    // RUN
    let svids = WatchlistCheck::get_overdue_scoped_vaults(conn, tenant.id, 100).unwrap();

    // ASSERTIONS
    assert_have_same_elements(vec![sv1, sv5, sv10, sv11, sv12, sv14], svids);
}

// arg not being able to re-use the api test fixtures here is kinda goofy. probably should just move
// all tests to api or something
fn make_vault(
    conn: &mut TestPgConn,
    tenant_id: &TenantId,
    is_live: bool,
    is_portable: bool,
    ob_decision_made_at: Option<DateTime<Utc>>,
    watchlist_checks_created_at: Vec<DateTime<Utc>>,
    enhanced_aml: EnhancedAmlOption,
) -> ScopedVaultId {
    let sv = if is_portable {
        let ob_config = fixtures::ob_configuration::create_with_opts(
            conn,
            tenant_id,
            ObConfigurationOpts {
                is_live,
                enhanced_aml,
                ..Default::default()
            },
        );
        let uv = fixtures::vault::create_person(conn, is_live);
        let uvid = uv.id.clone();
        let sv = fixtures::scoped_vault::create(conn, &uvid, &ob_config.id);
        if let Some(ob_decision_made_at) = ob_decision_made_at {
            let wf = fixtures::workflow::create(conn, &sv.id, &ob_config.id, None);

            let decision = NewDecisionArgs {
                vault_id: uv.id.clone(),
                logic_git_hash: "".to_string(),
                status: DecisionStatus::Pass,
                result_ids: vec![],
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno: DataLifetimeSeqno::from(0),
                manual_reviews: vec![],
                rule_set_result_id: None,
                failed_for_doc_review: false,
            };
            let wf = Workflow::lock(conn, &wf.id).unwrap();
            let update = WorkflowUpdate::set_decision(&wf, decision);
            let wf = Workflow::update(wf, conn, update).unwrap();
            // Patch the decision_made_at to make it look like it was made earlier
            use db_schema::schema::workflow;
            use diesel::prelude::*;
            diesel::update(workflow::table)
                .filter(workflow::id.eq(&wf.id))
                .set((
                    workflow::decision_made_at.eq(ob_decision_made_at),
                    workflow::completed_at.eq(ob_decision_made_at),
                ))
                .execute(conn.conn())
                .unwrap();
        }
        sv
    } else {
        let sandbox_id = (!is_live).then_some(crypto::random::gen_random_alphanumeric_code(10));
        let args = fixtures::vault::new_vault_args(VaultKind::Person, sandbox_id, false);
        fixtures::scoped_vault::create_non_portable(conn, args, tenant_id).0
    };

    for t in watchlist_checks_created_at {
        let svid = sv.id.clone();

        let task = Task::create_for_test(
            conn,
            NewTask {
                created_at: t,
                scheduled_for: t,
                task_data: TaskData::WatchlistCheck(WatchlistCheckArgs {
                    scoped_vault_id: svid.clone(),
                }),
                status: TaskStatus::Pending,
                num_attempts: 0,
                max_lease_duration_s: None,
                last_leased_at: None,
            },
        )
        .unwrap();

        WatchlistCheck::create_for_test(
            conn,
            NewWatchlistCheck {
                created_at: t,
                scoped_vault_id: svid,
                task_id: task.id,
                decision_intent_id: None,
                status: WatchlistCheckStatusKind::Pass,
                completed_at: Some(t),
                status_details: WatchlistCheckStatus::Pass,
            },
        )
        .unwrap();
    }

    sv.id
}
