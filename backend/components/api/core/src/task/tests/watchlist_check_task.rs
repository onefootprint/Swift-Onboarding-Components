use std::sync::Arc;

use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::task::tasks::watchlist_check_task::WatchlistCheckTask;
use crate::task::ExecuteTask;
use crate::task::TaskError;
use crate::State;
use db::models::scoped_vault::ScopedVault;
use db::models::task::Task;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::{RequestAndMaybeResult, VerificationRequest};
use db::models::watchlist_check::WatchlistCheck;
use db::tests::fixtures;
use db::tests::test_db_pool::TestDbPool;
use db::DbPool;
use db::DbResult;
use idv::idology::pa::{IdologyPaAPIResponse, IdologyPaRequest};
use macros::test_state;
use newtypes::FootprintReasonCode;
use newtypes::TaskId;
use newtypes::VendorAPI;
use newtypes::WatchlistCheckError;
use newtypes::WatchlistCheckNotNeededReason;
use newtypes::WatchlistCheckStatus;
use newtypes::{
    IdentityDataKind as IDK, OnboardingStatus, ScopedVaultId, WatchlistCheckArgs, WatchlistCheckStatusKind,
};
use webhooks::events::WebhookEvent;
use webhooks::MockWebhookClient;

type MockPaClient = MockVendorAPICall<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>;

#[test_state]
async fn non_live_vault(state: &mut State) {
    // SETUP
    let is_live = false;
    let onboarding_status = OnboardingStatus::Pass;
    let idks = full_vault();

    let (sv, task) = setup(&state.db_pool, is_live, onboarding_status, idks).await;

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::NotNeeded, wc.status);
    assert_eq!(
        WatchlistCheckStatus::NotNeeded(WatchlistCheckNotNeededReason::VaultNotLive),
        wc.status_details
    );
    assert!(vreqs.is_empty());
    assert!(ut.is_none());
}

// will make a test_db_pool_cases eventually :)
async fn non_active_onboarding_test_case(state: &mut State, onboarding_status: OnboardingStatus) {
    // SETUP
    let is_live = true;
    let idks = full_vault();

    let (sv, task) = setup(&state.db_pool, is_live, onboarding_status, idks).await;

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::NotNeeded, wc.status);
    assert_eq!(
        WatchlistCheckStatus::NotNeeded(WatchlistCheckNotNeededReason::VaultOffboarded),
        wc.status_details
    );
    assert!(vreqs.is_empty());
    assert!(ut.is_none());
}

#[test_state]
async fn onboarding_incomplete(state: &mut State) {
    non_active_onboarding_test_case(state, OnboardingStatus::Incomplete).await;
}
#[test_state]
async fn onboarding_pending(state: &mut State) {
    non_active_onboarding_test_case(state, OnboardingStatus::Pending).await;
}
#[test_state]
async fn onboarding_fail(state: &mut State) {
    non_active_onboarding_test_case(state, OnboardingStatus::Fail).await;
}

#[test_state]
async fn insufficient_data_in_vault(state: &mut State) {
    // SETUP
    let is_live = true;
    let onboarding_status = OnboardingStatus::Pass;
    let idks = vec![IDK::FirstName, IDK::LastName];

    let (sv, task) = setup(&state.db_pool, is_live, onboarding_status, idks).await;

    expect_webhook(
        state,
        WatchlistCheckStatusKind::Error,
        Some(WatchlistCheckError::RequiredDataNotPresent),
    );

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::Error, wc.status);
    assert!(vreqs.is_empty());
    assert!(ut.is_some());
}

#[test_state]
async fn vendor_error(state: &mut State) {
    // SETUP
    let is_live = true;
    let onboarding_status = OnboardingStatus::Pass;
    let idks = full_vault();

    let (sv, task) = setup(&state.db_pool, is_live, onboarding_status, idks).await;

    mock_idology_pa(
        state,
        Err(idv::idology::error::Error::UnknownError("uhoh".to_owned())),
    );

    // RUN
    let res = run_task(state, &sv.id, &task.id).await;

    // ASSERTIONS
    let (wc, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert!(matches!(res.err().unwrap(), TaskError::IdologyError(_)));
    assert_eq!(WatchlistCheckStatusKind::Pending, wc.status);
    assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
    assert!(vreqs[0].1.is_none());
    assert!(ut.is_none());
}

#[test_state]
async fn vendor_hit(state: &mut State) {
    // SETUP
    let is_live = true;
    let onboarding_status = OnboardingStatus::Pass;
    let idks = full_vault();

    let (sv, task) = setup(&state.db_pool, is_live, onboarding_status, idks).await;

    mock_idology_pa(state, Ok(idv::tests::fixtures::idology::create_response_pa_hit()));

    expect_webhook(state, WatchlistCheckStatusKind::Fail, None);

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::Fail, wc.status);
    assert_eq!(Some(vec![FootprintReasonCode::WatchlistHitOfac]), wc.reason_codes);
    assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
    assert!(vreqs[0].1.is_some());
    assert!(ut.is_some());
}

#[test_state]
async fn vendor_no_hit(state: &mut State) {
    // SETUP
    let is_live = true;
    let onboarding_status = OnboardingStatus::Pass;
    let idks = full_vault();

    let (sv, task) = setup(&state.db_pool, is_live, onboarding_status, idks).await;

    mock_idology_pa(
        state,
        Ok(idv::tests::fixtures::idology::create_response_pa_no_hit()),
    );

    expect_webhook(state, WatchlistCheckStatusKind::Pass, None);

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::Pass, wc.status);
    assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
    assert!(vreqs[0].1.is_some());
    assert!(ut.is_some());
}

#[test_state]
async fn non_portable_vault(state: &mut State) {
    // SETUP
    let is_live = true;
    let idks = full_vault();

    // TODO: probably is a better way to share more code with `setup`, but not a huge deal for now
    let (sv, task) = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let tenant = fixtures::tenant::create(conn);
            let (_uv, sv) = crate::tests::fixtures::lib::create_user_and_populate_vault(
                conn, is_live, tenant.id, None, idks,
            );
            let task = fixtures::task::create_watchlist_check(conn, &sv.id);
            Ok((sv, task))
        })
        .await
        .unwrap();

    mock_idology_pa(
        state,
        Ok(idv::tests::fixtures::idology::create_response_pa_no_hit()),
    );

    expect_webhook(state, WatchlistCheckStatusKind::Pass, None);

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::Pass, wc.status);
    assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
    assert!(vreqs[0].1.is_some());
    assert!(ut.is_some());
}

//
// Test Helpers
//

async fn setup(
    db_pool: &DbPool,
    is_live: bool,
    onboarding_status: OnboardingStatus,
    idks: Vec<IDK>,
) -> (ScopedVault, Task) {
    let (sv, task) = db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let (_, _, sv, _) = crate::tests::fixtures::lib::create_user_and_onboarding(
                conn,
                is_live,
                onboarding_status,
                idks,
            );
            let task = fixtures::task::create_watchlist_check(conn, &sv.id);
            Ok((sv, task))
        })
        .await
        .unwrap();

    (sv, task)
}

async fn run_task(state: &mut State, sv_id: &ScopedVaultId, task_id: &TaskId) -> Result<(), TaskError> {
    let wct = WatchlistCheckTask::new(state.clone(), task_id.clone());
    let args = WatchlistCheckArgs {
        scoped_vault_id: sv_id.clone(),
    };
    wct.execute(&args).await
}

async fn get_data(
    db_pool: &DbPool,
    svid: ScopedVaultId,
) -> (WatchlistCheck, Vec<RequestAndMaybeResult>, Option<UserTimeline>) {
    let (wc, vreqs, ut) = db_pool
        .db_query(move |conn| {
            let wc = WatchlistCheck::_get_by_svid(conn, &svid).unwrap();
            let ut = UserTimeline::get_by_event_data_id(conn, &svid, wc.id.to_string()).unwrap();
            let vreqs =
                VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user(conn, svid)
                    .unwrap();

            // TODO: add usertimeline
            (wc, vreqs, ut)
        })
        .await
        .unwrap();
    (wc, vreqs, ut)
}

fn full_vault() -> Vec<IDK> {
    vec![
        IDK::PhoneNumber,
        IDK::FirstName,
        IDK::LastName,
        IDK::AddressLine1,
        IDK::AddressLine2,
        IDK::City,
        IDK::State,
        IDK::Zip,
        IDK::Country,
    ]
}

fn mock_idology_pa(state: &mut State, res: Result<IdologyPaAPIResponse, idv::idology::error::Error>) {
    let mut mock = MockPaClient::new();
    mock.expect_make_request().times(1).return_once(|_| res);
    state.set_idology_pa(Arc::new(mock));
}

fn expect_webhook(state: &mut State, status: WatchlistCheckStatusKind, error: Option<WatchlistCheckError>) {
    let mut mock_webhook_client = MockWebhookClient::new();

    mock_webhook_client
        .expect_send_event_to_tenant_non_blocking()
        .withf(move |_, w, _| match w {
            WebhookEvent::WatchlistCheckCompleted(p) => p.status == status && p.error == error,
            _ => false,
        })
        .times(1)
        .return_const(());
    state.set_webhook_client(Arc::new(mock_webhook_client));
}
