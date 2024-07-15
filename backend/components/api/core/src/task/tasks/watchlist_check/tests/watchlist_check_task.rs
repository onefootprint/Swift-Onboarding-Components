use crate::task::tasks::watchlist_check::tests::*;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use chrono::Duration;
use chrono::Utc;
use db::test_helpers::assert_have_same_elements;
use db::tests::MockFFClient;
use db::DbError;
use db_schema::schema::verification_result;
use diesel::prelude::*;
use macros::test_state_case;
use newtypes::FootprintReasonCode;
use newtypes::IdentityDataKind as IDK;
use newtypes::OnboardingStatus;
use newtypes::PiiString;
use newtypes::VendorAPI;
use newtypes::WatchlistCheckError;
use newtypes::WatchlistCheckNotNeededReason;
use newtypes::WatchlistCheckStatus;
use newtypes::WatchlistCheckStatusKind;

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
        state,
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
    let (sv, task) = create_user_and_task(state, vault_kind, true, OnboardingStatus::Pass, idks).await;

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
        state,
        vault_kind.clone(),
        true,
        OnboardingStatus::Pass,
        full_vault(),
    )
    .await;

    if vault_kind.expects_idology() {
        mock_idology_pa(state, &VendorRes::Error);
    } else {
        let mut mock_ff_client = MockFFClient::new();
        mock_ff_client.mock(|c| {
            c.expect_flag().return_once(move |_| true);
        });
        state.set_ff_client(mock_ff_client.into_mock());
        mock_incode_watchlist_check(state, &VendorRes::Error);
    }

    expect_no_webhook(state);

    // RUN
    let res = run_task(state, &sv.id, &task.id).await;

    // ASSERTIONS
    let (wc, di, vreqs, ut, rs) = get_data(&state.db_pool, sv.id).await;

    let e = res.err().unwrap();
    assert!(
        e.message()
            == "Incode error: Incode API Error: IncodeAPIResponseError Something bad happened yo:  in >"
            || e.message() == "IDology error: Could not parse error code: uhoh"
    );

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
// Non portable vaults always have checks run even if they are in non-Pass states. although.. TODO: we should
// probably still skip checks for NPV's that are Fail?
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
    let (sv, task) = create_user_and_task(state, vault_kind.clone(), true, status, full_vault()).await;

    // Mock vendor + expect webhooks
    if vault_kind.expects_idology() {
        mock_idology_pa(state, &vendor_res);
    } else {
        // Simulate there being an existing search we just need to re-ping, since this is the most common
        // case
        save_existing_watchlist_check_vres(state, &sv.id).await;

        let mut mock_ff_client = MockFFClient::new();
        mock_ff_client.mock(|c| {
            c.expect_flag().return_once(move |_| true);
        });
        state.set_ff_client(mock_ff_client.into_mock());
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
        assert_eq!(2, vreqs.len()); //1 for start onboarding, 1 for IncodeUpdatedWatchlistResultcall. NO calls to IncodeWatchlistCheck
                                    // itself!
        let vreq_vres = vreqs
            .iter()
            .find(|v| v.0.vendor_api == VendorAPI::IncodeUpdatedWatchlistResult)
            .unwrap();
        assert!(vreq_vres.1.is_some());
        assert!(!vreq_vres.1.as_ref().unwrap().is_error);
    }
}

enum ExistingSearchCase {
    NoVres,
    VresOlderThan365Days,
    VaultDataChangedSinceVres(VaultDataChange),
}
enum VaultDataChange {
    Dob,
    Name,
}

#[test_state_case(ExistingSearchCase::NoVres)]
#[test_state_case(ExistingSearchCase::VresOlderThan365Days)]
#[test_state_case(ExistingSearchCase::VaultDataChangedSinceVres(VaultDataChange::Dob))]
#[test_state_case(ExistingSearchCase::VaultDataChangedSinceVres(VaultDataChange::Name))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn incode_new_search_needed(state: &mut State, case: ExistingSearchCase) {
    // SETUP
    let (sv, task) = create_user_and_task(
        state,
        VaultKind::Portable(enhanced_aml_option_yes()),
        true,
        OnboardingStatus::Pass,
        full_vault(),
    )
    .await;

    match case {
        ExistingSearchCase::NoVres => {}
        ExistingSearchCase::VresOlderThan365Days => {
            let vres = save_existing_watchlist_check_vres(state, &sv.id).await;
            state
                .db_pool
                .db_query(move |conn| {
                    diesel::update(verification_result::table)
                        .filter(verification_result::id.eq(vres.id))
                        .set(verification_result::timestamp.eq(Utc::now() - Duration::days(366)))
                        .execute(conn)
                        .map_err(DbError::from)
                })
                .await
                .unwrap();
        }
        ExistingSearchCase::VaultDataChangedSinceVres(data_changed) => {
            let svid = sv.id.clone();
            state
                .db_pool
                .db_transaction(move |conn| -> DbResult<()> {
                    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &svid).unwrap();
                    let data = match data_changed {
                        VaultDataChange::Dob => {
                            vec![(IDK::Dob.into(), PiiString::new("1944-01-03".to_owned()))]
                        }
                        VaultDataChange::Name => {
                            vec![
                                (IDK::FirstName.into(), PiiString::new("Carl".to_owned())),
                                (IDK::LastName.into(), PiiString::new("Carlito".to_owned())),
                            ]
                        }
                    };
                    uvw.patch_data_test(conn, data, true).unwrap();
                    Ok(())
                })
                .await
                .unwrap();
        }
    }

    // No vres for IncodeWatchlistCheck exists! Theoretically an impossible scenario (cause we should
    // have made such a call when the sv was onboarded) but still good to handle and this will be
    // extended to handle 2 more cases where a fresh search must be performed: (1) if its been >365d
    let mut mock_ff_client = MockFFClient::new();
    mock_ff_client.mock(|c| {
        c.expect_flag().return_once(move |_| true);
    });
    state.set_ff_client(mock_ff_client.into_mock());
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
