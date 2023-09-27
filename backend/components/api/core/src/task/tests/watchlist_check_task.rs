use crate::task::tests::*;

use crate::task::TaskError;
use crate::State;
use db::tests::test_db_pool::TestDbPool;
use macros::test_state;
use macros::test_state_case;
use newtypes::FootprintReasonCode;
use newtypes::VendorAPI;
use newtypes::WatchlistCheckError;
use newtypes::WatchlistCheckNotNeededReason;
use newtypes::WatchlistCheckStatus;
use newtypes::{IdentityDataKind as IDK, OnboardingStatus, WatchlistCheckStatusKind};

#[test_state_case(
    true,
    OnboardingStatus::Incomplete,
    WatchlistCheckNotNeededReason::VaultOffboarded
)]
#[test_state_case(
    true,
    OnboardingStatus::Pending,
    WatchlistCheckNotNeededReason::VaultOffboarded
)]
#[test_state_case(true, OnboardingStatus::Fail, WatchlistCheckNotNeededReason::VaultOffboarded)]
#[test_state_case(
    false,
    OnboardingStatus::Incomplete,
    WatchlistCheckNotNeededReason::VaultNotLive
)]
#[test_state_case(false, OnboardingStatus::Pending, WatchlistCheckNotNeededReason::VaultNotLive)]
#[test_state_case(false, OnboardingStatus::Fail, WatchlistCheckNotNeededReason::VaultNotLive)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn sandbox_and_inactive_users(
    state: &mut State,
    is_live: bool,
    onboarding_status: OnboardingStatus,
    expected_reason: WatchlistCheckNotNeededReason,
) {
    // SETUP
    let (sv, task) =
        create_user_and_task(&state.db_pool, true, is_live, onboarding_status, full_vault()).await;

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, di, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::NotNeeded, wc.status);
    assert_eq!(
        WatchlistCheckStatus::NotNeeded(expected_reason),
        wc.status_details
    );
    assert!(ut.is_none());

    assert!(di.is_none());
    assert!(vreqs.is_empty());
}

#[test_state_case(true)]
#[test_state_case(false)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn insufficient_data_in_vault(state: &mut State, is_portable: bool) {
    // SETUP
    let idks = vec![IDK::FirstName, IDK::LastName]; // Idology requires Address as well. TODO: when we add Incode they only require first + last so tests will get more fun
    let (sv, task) =
        create_user_and_task(&state.db_pool, is_portable, true, OnboardingStatus::Pass, idks).await;

    expect_webhook(
        state,
        WatchlistCheckStatusKind::Error,
        Some(WatchlistCheckError::RequiredDataNotPresent),
    );

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, di, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::Error, wc.status);
    assert!(ut.is_some());

    assert!(di.is_some());
    assert!(vreqs.is_empty());
}

#[test_state]
async fn vendor_error(state: &mut State) {
    // SETUP
    let (sv, task) =
        create_user_and_task(&state.db_pool, true, true, OnboardingStatus::Pass, full_vault()).await;
    mock_idology_pa(state, &VendorRes::Error);

    expect_no_webhook(state);

    // RUN
    let res = run_task(state, &sv.id, &task.id).await;

    // ASSERTIONS
    let (wc, di, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    let TaskError::ApiError(e) = res.err().unwrap() else {
        panic!();
    };
    assert!(matches!(e.kind(), crate::ApiErrorKind::VendorRequestFailed(_)));

    assert_eq!(WatchlistCheckStatusKind::Pending, wc.status);
    assert!(ut.is_none());

    assert!(di.is_some());
    // vreq + vres is saved with is_error=true
    assert_eq!(1, vreqs.len());
    assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
    assert!(vreqs[0].1.is_some());
    assert!(vreqs[0].1.as_ref().unwrap().is_error);
}

#[test_state_case(true, OnboardingStatus::Pass, VendorRes::Hit, (WatchlistCheckStatusKind::Fail, vec![FootprintReasonCode::WatchlistHitOfac]))]
#[test_state_case(true, OnboardingStatus::Pass, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[test_state_case(false, OnboardingStatus::Pass, VendorRes::Hit, (WatchlistCheckStatusKind::Fail, vec![FootprintReasonCode::WatchlistHitOfac]))]
#[test_state_case(false, OnboardingStatus::Pass, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
// Non portable vaults always have checks run even if they are in non-Pass states. although.. TODO: we should probably still skip checks for NPV's that are Fail?
#[test_state_case(false, OnboardingStatus::Incomplete, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[test_state_case(false, OnboardingStatus::Pending, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[test_state_case(false, OnboardingStatus::Fail, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn active_users(
    state: &mut State,
    is_portable: bool,
    status: OnboardingStatus,
    vendor_res: VendorRes,
    expect: (WatchlistCheckStatusKind, Vec<FootprintReasonCode>),
) {
    let (expected_status, expected_reason_codes) = expect;
    // SETUP
    let (sv, task) = create_user_and_task(&state.db_pool, is_portable, true, status, full_vault()).await;

    // Mock vendor + expect webhooks
    mock_idology_pa(state, &vendor_res);
    expect_webhook(state, expected_status, None);

    // RUN
    let _ = run_task(state, &sv.id, &task.id).await;

    // ASSERTIONS
    let (wc, di, vreqs, ut) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(expected_status, wc.status);
    assert_eq!(Some(expected_reason_codes), wc.reason_codes);
    assert!(ut.is_some());

    assert!(di.is_some());
    assert_eq!(1, vreqs.len());
    assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
    assert!(vreqs[0].1.is_some());
    assert!(!vreqs[0].1.as_ref().unwrap().is_error);
}
