use crate::models::onboarding::Onboarding;
use crate::models::onboarding::OnboardingUpdate;
use crate::models::task::NewTask;
use crate::models::task::Task;
use crate::models::watchlist_check::NewWatchlistCheck;
use crate::models::watchlist_check::WatchlistCheck;
use crate::models::workflow::Workflow;
use crate::models::workflow::WorkflowUpdate;
use crate::test_helpers::have_same_elements;
use crate::tests::fixtures;
use crate::tests::prelude::*;
use chrono::DateTime;
use chrono::Duration;
use chrono::Utc;
use macros::db_test;
use newtypes::OnboardingStatus;
use newtypes::ScopedVaultId;
use newtypes::TaskData;
use newtypes::TaskStatus;
use newtypes::TenantId;
use newtypes::VaultKind;
use newtypes::WatchlistCheckArgs;
use newtypes::WatchlistCheckStatus;
use newtypes::WatchlistCheckStatusKind;

#[db_test]
fn test_watchlist_check(conn: &mut TestPgConn) {
    // SETUP
    let tenant = fixtures::tenant::create(conn);
    let tenant_id = tenant.id.clone();

    let ten_days_ago = Utc::now() - Duration::days(10);
    let twenty_days_ago = Utc::now() - Duration::days(20);
    let forty_days_ago = Utc::now() - Duration::days(40);
    let fifty_days_ago = Utc::now() - Duration::days(50);

    let sv1 = make_vault(conn, &tenant_id, true, true, Some(forty_days_ago), vec![]);
    let _sv2 = make_vault(conn, &tenant_id, true, true, Some(twenty_days_ago), vec![]);
    let _sv3 = make_vault(conn, &tenant_id, false, true, Some(forty_days_ago), vec![]);
    let _sv4 = make_vault(conn, &tenant_id, false, true, Some(twenty_days_ago), vec![]);
    let sv5 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(forty_days_ago),
        vec![forty_days_ago],
    );

    let _sv6 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(forty_days_ago),
        vec![twenty_days_ago],
    );
    let _sv7 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(forty_days_ago),
        vec![ten_days_ago, twenty_days_ago, forty_days_ago],
    );
    let _sv8 = make_vault(
        conn,
        &tenant_id,
        true,
        true,
        Some(twenty_days_ago),
        vec![forty_days_ago, fifty_days_ago],
    );
    let _sv9 = make_vault(
        conn,
        &tenant_id,
        true,
        false,
        None,
        vec![ten_days_ago, twenty_days_ago],
    );
    let sv10 = make_vault(conn, &tenant_id, true, false, None, vec![forty_days_ago]);
    let sv11 = make_vault(conn, &tenant_id, true, false, None, vec![]);

    // RUN
    let svids = WatchlistCheck::get_overdue_scoped_vaults(conn, tenant.id).unwrap();

    // ASSERTIONS
    assert!(have_same_elements(vec![sv1, sv5, sv10, sv11], svids))
}

// arg not being able to re-use the api test fixtures here is kinda goofy. probably should just move all tests to api or something
fn make_vault(
    conn: &mut TestPgConn,
    tenant_id: &TenantId,
    is_live: bool,
    is_portable: bool,
    ob_decision_made_at: Option<DateTime<Utc>>,
    watchlist_checks_created_at: Vec<DateTime<Utc>>,
) -> ScopedVaultId {
    let sv = if is_portable {
        let ob_config = fixtures::ob_configuration::create(conn, tenant_id, is_live);
        let uv = fixtures::vault::create_person(conn, is_live);
        let uvid = uv.id.clone();
        let sv = fixtures::scoped_vault::create(conn, &uvid, &ob_config.id);
        let svid = sv.id.clone();
        if let Some(ob_decision_made_at) = ob_decision_made_at {
            let (ob, wf) = fixtures::onboarding::create(conn, svid, ob_config.id, None);
            let ob = Onboarding::lock(conn, &ob.id).unwrap();
            let update = OnboardingUpdate {
                status: Some(OnboardingStatus::Pass),
                ..Default::default()
            };
            Onboarding::update(ob, conn, &wf.id, update).unwrap();
            let update = WorkflowUpdate {
                decision_made_at: Some(Some(ob_decision_made_at)),
                status: None,
                authorized_at: None,
            };
            Workflow::update(conn, &wf.id, update).unwrap();
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
