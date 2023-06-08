use crate::auth::tenant::AuthActor;
use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_incode, mock_twilio, mock_webhook, query_data, setup_data,
    ExpectedRequiresManualReview, ExpectedStatus, UserKind, WithHit,
};
use crate::decision::state::DocCollected;
use crate::decision::state::ReviewCompleted;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::decision::tests::test_helpers;
use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::utils::mock_enclave::MockEnclave;
use crate::{decision::state::alpaca_kyc::*, State};
use api_wire_types::{CreateAnnotationRequest, DecisionRequest, TerminalDecisionStatus};
use chrono::Utc;
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::RiskSignal;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::tenant_user::TenantUser;
use db::models::tenant_vendor::TenantVendorControl;
use db::models::verification_request::VerificationRequest;
use db::models::workflow::NewWorkflow;
use db::models::workflow::Workflow;
use db::models::workflow_event::WorkflowEvent;
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures;
use db::tests::test_db_pool::TestDbPool;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use feature_flag::MockFeatureFlagClient;
use idv::experian::ExperianCrossCoreRequest;
use idv::experian::ExperianCrossCoreResponse;
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::incode::watchlist::IncodeWatchlistCheckRequest;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use itertools::Itertools;
use macros::{test_db_pool, test_state_case};
use newtypes::{AlpacaKycState, CipKind, DbActor, SealedVaultBytes};
use newtypes::{CollectedDataOption as CDO, OnboardingStatus};
use newtypes::{FootprintReasonCode, TenantUserId};
use newtypes::{KycConfig, ScopedVaultId};
use newtypes::{KycState, WorkflowId, WorkflowState};
use newtypes::{SignalSeverity, WorkflowConfig};
use std::str::FromStr;
use std::sync::Arc;

///
///
///
///

#[test_state_case(UserKind::Demo)]
#[test_state_case(UserKind::Sandbox)]
#[test_state_case(UserKind::Live)]
#[tokio::test]
async fn pass(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(
        state,
        user_kind,
        Some(CipKind::Alpaca),
        matches!(user_kind, UserKind::Sandbox).then(|| "pass".to_owned()),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    mock_ff_client
        .expect_flag()
        .times(3)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(state);
            mock_twilio(state);
            mock_incode(state, WithHit(false));
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    /// TESTS
    ///
    /// Authorize
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, fps) = query_data(state, &svid, &wfid).await;
    assert!(ob.authorized_at.is_some());
    assert!(ob.idv_reqs_initiated_at.is_some());
    assert!(ob.decision_made_at.is_none());
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state);
    assert!(!fps.is_empty()); //fingerprints were written

    /// MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    /// MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    // Assert no OBD is created yet and ob status is pending
    assert!(obd.is_none());
    assert_eq!(OnboardingStatus::Pending, ob.status);
    assert!(ob.decision_made_at.is_none());
    assert!(mr.is_none());

    // Expect Webhook
    mock_webhook(
        state,
        ExpectedStatus(OnboardingStatus::Pass),
        ExpectedRequiresManualReview(false),
    );

    /// MakeWatchlistCheckCall
    let (ww, _) = ww
        .action(
            state,
            WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall {}),
        )
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    assert_eq!(OnboardingStatus::Pass, ob.status);
    assert!(mr.is_none());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox => {
            assert_have_same_elements(
                vec![
                    FootprintReasonCode::AddressMatches,
                    FootprintReasonCode::DobMatches,
                    FootprintReasonCode::SsnMatches,
                    FootprintReasonCode::NameFirstMatches,
                    FootprintReasonCode::NameLastMatches,
                ],
                rs.into_iter().map(|rs| rs.reason_code).collect_vec(),
            );
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    FootprintReasonCode::AddressMatches,
                    FootprintReasonCode::AddressZipCodeMatches,
                    FootprintReasonCode::AddressStreetNameMatches,
                    FootprintReasonCode::AddressStreetNumberMatches,
                    FootprintReasonCode::AddressStateMatches,
                    FootprintReasonCode::DobYobMatches,
                    FootprintReasonCode::DobMobMatches,
                    FootprintReasonCode::SsnMatches,
                    FootprintReasonCode::NameLastMatches,
                    FootprintReasonCode::NameMatches,
                    FootprintReasonCode::DobMatches,
                    FootprintReasonCode::IpStateMatches,
                    FootprintReasonCode::PhoneNumberMatches,
                    FootprintReasonCode::InputPhoneNumberMatchesInputState,
                    FootprintReasonCode::InputPhoneNumberMatchesLocatedStateHistory,
                ],
                rs.into_iter().map(|rs| rs.reason_code).collect_vec(),
            );
        }
    };
}

#[test_state_case(UserKind::Live, TerminalDecisionStatus::Pass)]
#[test_state_case(UserKind::Live, TerminalDecisionStatus::Fail)]
#[test_state_case(UserKind::Sandbox, TerminalDecisionStatus::Pass)]
#[test_state_case(UserKind::Sandbox, TerminalDecisionStatus::Fail)]
#[tokio::test]
async fn pass_then_watchlist_hit(
    state: &mut State,
    user_kind: UserKind,
    review_decision: TerminalDecisionStatus,
) {
    /// DATA SETUP
    let (wf, tenant, obc, tu) = setup_data(
        state,
        user_kind,
        Some(CipKind::Alpaca),
        matches!(user_kind, UserKind::Sandbox).then(|| "manualreview".to_owned()),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    mock_ff_client
        .expect_flag()
        .times(3)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(state);
            mock_twilio(state);
            mock_incode(state, WithHit(true));
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    /// TESTS
    ///
    /// Authorize
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, fps) = query_data(state, &svid, &wfid).await;
    assert!(ob.authorized_at.is_some());
    assert!(ob.idv_reqs_initiated_at.is_some());
    assert!(ob.decision_made_at.is_none());
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state);
    assert!(!fps.is_empty()); //fingerprints were written

    /// MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    /// MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    // Assert no OBD is created yet and ob status is pending
    assert!(obd.is_none());
    assert_eq!(OnboardingStatus::Pending, ob.status);
    assert!(ob.decision_made_at.is_none());
    assert!(mr.is_none());

    // Expect Webhook
    mock_webhook(
        state,
        ExpectedStatus(OnboardingStatus::Fail),
        ExpectedRequiresManualReview(true),
    );

    /// MakeWatchlistCheckCall
    let (ww, _) = ww
        .action(
            state,
            WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall {}),
        )
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::PendingReview), wf.state);
    assert_eq!(OnboardingStatus::Fail, ob.status);
    assert!(mr.is_some());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox => {
            // TODO: In Demo + Sandbox, we are currently making real Incode watchlist calls (which is wrong). But when we respect the fixtures, we'll probably
            // check for the presence of any random watchlist reason code here
            assert!(rs
                .into_iter()
                .any(|rs| rs.reason_code == FootprintReasonCode::WatchlistHitOfac));
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    FootprintReasonCode::WatchlistHitOfac, // has watchlist reason code
                    FootprintReasonCode::AddressMatches,
                    FootprintReasonCode::AddressZipCodeMatches,
                    FootprintReasonCode::AddressStreetNameMatches,
                    FootprintReasonCode::AddressStreetNumberMatches,
                    FootprintReasonCode::AddressStateMatches,
                    FootprintReasonCode::DobYobMatches,
                    FootprintReasonCode::DobMobMatches,
                    FootprintReasonCode::DobMatches,
                    FootprintReasonCode::NameMatches,
                    FootprintReasonCode::SsnMatches,
                    FootprintReasonCode::NameLastMatches,
                    FootprintReasonCode::IpStateMatches,
                    FootprintReasonCode::PhoneNumberMatches,
                    FootprintReasonCode::InputPhoneNumberMatchesInputState,
                    FootprintReasonCode::InputPhoneNumberMatchesLocatedStateHistory,
                ],
                rs.into_iter().map(|rs| rs.reason_code).collect_vec(),
            );
        }
    };

    // ReviewCompleted
    let (ww, _) = ww
        .action(
            state,
            WorkflowActions::ReviewCompleted(crate::decision::state::ReviewCompleted {
                decision: DecisionRequest {
                    annotation: CreateAnnotationRequest {
                        note: "yo".to_owned(),
                        is_pinned: false,
                    },
                    status: review_decision,
                },
                actor: AuthActor::TenantUser(tu.id),
            }),
        )
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    assert!(mr.is_none()); // kinda weird but Onboarding::get returns only the current active review and now the review has been completed
    match review_decision {
        TerminalDecisionStatus::Pass => {
            assert_eq!(OnboardingStatus::Pass, ob.status);
            assert!(matches!(obd.unwrap().actor, DbActor::TenantUser { id }));
        }
        TerminalDecisionStatus::Fail => {
            assert_eq!(OnboardingStatus::Fail, ob.status);
        }
    }
}

// TODO: currently can only stepup in Sandbox through fixture because we don't have Alpaca rules configured yet to do real stepups
// #[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox)]
#[tokio::test]
async fn step_up(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, tu) =
        setup_data(state, user_kind, Some(CipKind::Alpaca), Some("stepup".to_owned())).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    mock_ff_client
        .expect_flag()
        .times(3)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            todo!();
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    /// TESTS
    ///
    /// Authorize
    let ww: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, fps) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::DocCollection), wf.state);
    assert!(ob.authorized_at.is_some());
    assert!(ob.idv_reqs_initiated_at.is_some());
    // Assert no OBD is created yet and ob status is pending
    assert!(obd.is_none());
    assert_eq!(OnboardingStatus::Incomplete, ob.status);
    assert!(ob.decision_made_at.is_none());
    assert!(mr.is_none());
    assert!(!fps.is_empty()); //fingerprints were written

    // Expect Webhook
    mock_webhook(
        state,
        ExpectedStatus(OnboardingStatus::Fail),
        ExpectedRequiresManualReview(true),
    );

    /// DocCollected
    let ww = ww
        .run(
            state,
            WorkflowActions::DocCollected(crate::decision::state::DocCollected {}),
        )
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::PendingReview), wf.state);
    assert_eq!(OnboardingStatus::Fail, ob.status);
    assert!(mr.is_some());

    // TODO: maybe assert risk signals here

    // ReviewCompleted
    let (ww, _) = ww
        .action(
            state,
            WorkflowActions::ReviewCompleted(crate::decision::state::ReviewCompleted {
                decision: DecisionRequest {
                    annotation: CreateAnnotationRequest {
                        note: "yo".to_owned(),
                        is_pinned: false,
                    },
                    status: TerminalDecisionStatus::Pass,
                },
                actor: AuthActor::TenantUser(tu.id),
            }),
        )
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    assert!(mr.is_none()); // kinda weird but Onboarding::get returns only the current active review and now the review has been completed
    assert_eq!(OnboardingStatus::Pass, ob.status);
    assert!(matches!(obd.unwrap().actor, DbActor::TenantUser { id }));
}
