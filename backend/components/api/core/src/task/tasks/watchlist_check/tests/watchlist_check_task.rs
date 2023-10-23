use crate::task::tasks::watchlist_check::tests::*;
use crate::task::TaskError;
use crate::State;
use db::test_helpers::assert_have_same_elements;
use db::tests::test_db_pool::TestDbPool;
use feature_flag::MockFeatureFlagClient;
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
    let (sv, task) = create_user_and_task(
        &state.db_pool,
        VaultKind::Portable(enhanced_aml_option_yes()),
        is_live,
        onboarding_status,
        full_vault(),
    )
    .await;

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, di, vreqs, ut, rs) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::NotNeeded, wc.status);
    assert_eq!(
        WatchlistCheckStatus::NotNeeded(expected_reason),
        wc.status_details
    );
    assert!(ut.is_none());

    assert!(di.is_none());
    assert!(vreqs.is_empty());
    assert!(rs.is_empty());
}

#[test_state_case(VaultKind::Portable(EnhancedAmlOption::No))]
#[test_state_case(VaultKind::Portable(enhanced_aml_option_yes()))]
#[test_state_case(VaultKind::NonPortable)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn insufficient_data_in_vault(state: &mut State, vault_kind: VaultKind) {
    // SETUP
    let idks = if vault_kind.expects_idology() {
        vec![IDK::FirstName, IDK::LastName] // Idology requires address too
    } else {
        vec![] // Incode only requires first+last name
    };
    let (sv, task) =
        create_user_and_task(&state.db_pool, vault_kind, true, OnboardingStatus::Pass, idks).await;

    expect_webhook(
        state,
        WatchlistCheckStatusKind::Error,
        Some(WatchlistCheckError::RequiredDataNotPresent),
    );

    // RUN
    run_task(state, &sv.id, &task.id).await.unwrap();

    // ASSERTIONS
    let (wc, di, vreqs, ut, rs) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(WatchlistCheckStatusKind::Error, wc.status);
    assert!(ut.is_some());

    assert!(di.is_some());
    assert!(vreqs.is_empty());
    assert!(rs.is_empty());
}

#[test_state_case(VaultKind::Portable(EnhancedAmlOption::No))]
#[test_state_case(VaultKind::Portable(enhanced_aml_option_yes()))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn vendor_error(state: &mut State, vault_kind: VaultKind) {
    // SETUP
    let (sv, task) = create_user_and_task(
        &state.db_pool,
        vault_kind.clone(),
        true,
        OnboardingStatus::Pass,
        full_vault(),
    )
    .await;

    if vault_kind.expects_idology() {
        mock_idology_pa(state, &VendorRes::Error);
    } else {
        let mut mock_ff_client = MockFeatureFlagClient::new();
        mock_ff_client.expect_flag().return_once(move |_| true);
        state.set_ff_client(Arc::new(mock_ff_client));
        mock_incode_watchlist_check(state, &VendorRes::Error);
    }

    expect_no_webhook(state);

    // RUN
    let res = run_task(state, &sv.id, &task.id).await;

    // ASSERTIONS
    let (wc, di, vreqs, ut, rs) = get_data(&state.db_pool, sv.id).await;

    let TaskError::ApiError(e) = res.err().unwrap() else {
        panic!();
    };
    assert!(matches!(
        e.kind(),
        crate::ApiErrorKind::VendorRequestFailed(_) | crate::ApiErrorKind::IdvError(_)
    ));

    assert_eq!(WatchlistCheckStatusKind::Pending, wc.status);
    assert!(ut.is_none());
    assert!(rs.is_empty());
    assert!(di.is_some());
    // vreq + vres is saved with is_error=true
    if vault_kind.expects_idology() {
        assert_eq!(1, vreqs.len());
        assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
        assert!(vreqs[0].1.is_some());
        assert!(vreqs[0].1.as_ref().unwrap().is_error);
    } else {
        assert_eq!(2, vreqs.len()); //1 for start onboarding, 1 for watchlist call
        let vreq_vres = vreqs
            .iter()
            .find(|v| v.0.vendor_api == VendorAPI::IncodeWatchlistCheck)
            .unwrap();
        assert!(vreq_vres.1.is_some());
        assert!(vreq_vres.1.as_ref().unwrap().is_error);
    }
}

#[test_state_case(VaultKind::Portable(EnhancedAmlOption::No), OnboardingStatus::Pass, VendorRes::Hit, (WatchlistCheckStatusKind::Fail, vec![FootprintReasonCode::WatchlistHitOfac]))]
#[test_state_case(VaultKind::Portable(enhanced_aml_option_yes()), OnboardingStatus::Pass, VendorRes::Hit, (WatchlistCheckStatusKind::Fail, vec![FootprintReasonCode::WatchlistHitOfac]))]
#[test_state_case(VaultKind::Portable(EnhancedAmlOption::No), OnboardingStatus::Pass, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[test_state_case(VaultKind::Portable(enhanced_aml_option_yes()), OnboardingStatus::Pass, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[test_state_case(VaultKind::NonPortable, OnboardingStatus::Pass, VendorRes::Hit, (WatchlistCheckStatusKind::Fail, vec![FootprintReasonCode::WatchlistHitOfac]))]
#[test_state_case(VaultKind::NonPortable, OnboardingStatus::Pass, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
// Non portable vaults always have checks run even if they are in non-Pass states. although.. TODO: we should probably still skip checks for NPV's that are Fail?
#[test_state_case(VaultKind::NonPortable, OnboardingStatus::Incomplete, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[test_state_case(VaultKind::NonPortable, OnboardingStatus::Pending, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[test_state_case(VaultKind::NonPortable, OnboardingStatus::Fail, VendorRes::NoHit, (WatchlistCheckStatusKind::Pass, vec![]))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn active_users(
    state: &mut State,
    vault_kind: VaultKind,
    status: OnboardingStatus,
    vendor_res: VendorRes,
    expect: (WatchlistCheckStatusKind, Vec<FootprintReasonCode>),
) {
    let (expected_status, expected_reason_codes) = expect;
    // SETUP
    let (sv, task) =
        create_user_and_task(&state.db_pool, vault_kind.clone(), true, status, full_vault()).await;

    // Mock vendor + expect webhooks
    if vault_kind.expects_idology() {
        mock_idology_pa(state, &vendor_res);
    } else {
        // Simulate there being an existing search we just need to re-ping, since this is the most common case
        save_existing_watchlist_check_vres(state, &sv.id).await;

        let mut mock_ff_client = MockFeatureFlagClient::new();
        mock_ff_client.expect_flag().return_once(move |_| true);
        state.set_ff_client(Arc::new(mock_ff_client));
        mock_incode_updated_watchlist_result(state, &vendor_res);
    }
    expect_webhook(state, expected_status, None);

    // RUN
    let _ = run_task(state, &sv.id, &task.id).await;

    // ASSERTIONS
    let (wc, di, vreqs, ut, rs) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(expected_status, wc.status);
    assert_eq!(Some(expected_reason_codes.clone()), wc.reason_codes);
    assert_have_same_elements(
        expected_reason_codes,
        rs.into_iter().map(|r| r.reason_code).collect(),
    );
    assert!(ut.is_some());
    assert!(di.is_some());

    if vault_kind.expects_idology() {
        assert_eq!(1, vreqs.len());
        assert_eq!(VendorAPI::IdologyPa, vreqs[0].0.vendor_api);
        assert!(vreqs[0].1.is_some());
        assert!(!vreqs[0].1.as_ref().unwrap().is_error);
    } else {
        assert_eq!(2, vreqs.len()); //1 for start onboarding, 1 for IncodeUpdatedWatchlistResultcall. NO calls to IncodeWatchlistCheck itself!
        let vreq_vres = vreqs
            .iter()
            .find(|v| v.0.vendor_api == VendorAPI::IncodeUpdatedWatchlistResult)
            .unwrap();
        assert!(vreq_vres.1.is_some());
        assert!(!vreq_vres.1.as_ref().unwrap().is_error);
    }
}

#[test_state]
async fn incode_no_existing_watchlist_check_vres(state: &mut State) {
    // SETUP
    let (sv, task) = create_user_and_task(
        &state.db_pool,
        VaultKind::Portable(enhanced_aml_option_yes()),
        true,
        OnboardingStatus::Pass,
        full_vault(),
    )
    .await;

    // No vres for IncodeWatchlistCheck exists! Theoretically an impossible scenario (cause we should have made such a call when the sv was onboarded) but still good to handle and this will be extended to handle 2 more cases where a fresh search must be performed: (1) if its been >365d
    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client.expect_flag().return_once(move |_| true);
    state.set_ff_client(Arc::new(mock_ff_client));
    mock_incode_watchlist_check(state, &VendorRes::NoHit);

    // expect_webhook(state, expected_status, None);

    // RUN
    let _ = run_task(state, &sv.id, &task.id).await;

    // ASSERTIONS
    let (_, _, vreqs, _, _) = get_data(&state.db_pool, sv.id).await;

    assert_eq!(2, vreqs.len()); //1 for start onboarding, 1 for watchlist call
    let vreq_vres = vreqs
        .iter()
        .find(|v| v.0.vendor_api == VendorAPI::IncodeWatchlistCheck)
        .unwrap();
    assert!(vreq_vres.1.is_some());
}

fn enhanced_aml_option_yes() -> EnhancedAmlOption {
    EnhancedAmlOption::Yes {
        ofac: true,
        pep: true,
        adverse_media: true,
        continuous_monitoring: true,
        adverse_media_lists: None,
    }
}
