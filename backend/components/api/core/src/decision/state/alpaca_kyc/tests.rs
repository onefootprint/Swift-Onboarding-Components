use crate::auth::tenant::AuthActor;
use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_incode, mock_twilio, mock_webhook, query_data, setup_data,
    ExpectedRequiresManualReview, ExpectedStatus, UserKind, WithHit, WithQualifier,
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
use newtypes::{
    AlpacaKycConfig, AlpacaKycState, CipKind, DbActor, DecisionStatus, ObConfigurationKey, SealedVaultBytes,
};
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
#[test_state_case(UserKind::Sandbox("pass"))]
#[test_state_case(UserKind::Live)]
#[tokio::test]
async fn pass(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, _tu) =
        setup_data(state, user_kind, Some(CipKind::Alpaca), user_kind.phone_suffix()).await;
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
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(state, WithQualifier(None));
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
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Pass);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert!(mr.is_none());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
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
#[test_state_case(UserKind::Sandbox("manualreview"), TerminalDecisionStatus::Pass)]
#[test_state_case(UserKind::Sandbox("manualreview"), TerminalDecisionStatus::Fail)]
#[tokio::test]
async fn pass_then_watchlist_hit(
    state: &mut State,
    user_kind: UserKind,
    review_decision: TerminalDecisionStatus,
) {
    /// DATA SETUP
    let (wf, tenant, obc, tu) =
        setup_data(state, user_kind, Some(CipKind::Alpaca), user_kind.phone_suffix()).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .times(3)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(state, WithQualifier(None));
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
        UserKind::Demo | UserKind::Sandbox(_) => {
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

            // Test Redo as well
            match user_kind {
                // TODO: we don't really currently provide a way to specicfy fixtures for a Redo flow
                UserKind::Demo | UserKind::Sandbox(_) => {}
                UserKind::Live => {
                    redo_and_pass(state, user_kind, &ob, &obd.unwrap(), &tenant.id, &obc.key).await;
                }
            }
        }
    }
}

// TODO: currently can only stepup in Sandbox through fixture because we don't have Alpaca rules configured yet to do real stepups
// #[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox("stepup"))]
#[tokio::test]
async fn step_up(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, tu) =
        setup_data(state, user_kind, Some(CipKind::Alpaca), user_kind.phone_suffix()).await;
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
        UserKind::Demo | UserKind::Sandbox(_) => {}
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

#[test_state_case(UserKind::Sandbox("fail"))]
#[test_state_case(UserKind::Live)]
#[tokio::test]
async fn fail(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, _tu) =
        setup_data(state, user_kind, Some(CipKind::Alpaca), user_kind.phone_suffix()).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .times(2)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(
                state,
                WithQualifier(Some("resultcode.ssn.does.not.match".to_owned())),
            );
            mock_twilio(state);
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

    // Expect Webhook
    let expect_review = match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => false,
        UserKind::Live => {
            // TODO: this is wrong! When we add proper Alpaca rules then we should not be raising a review
            true
        }
    };
    mock_webhook(
        state,
        ExpectedStatus(OnboardingStatus::Fail),
        ExpectedRequiresManualReview(false),
    );

    /// MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Fail);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Fail, ob.status);
    assert!(ob.decision_made_at.is_some());
    assert!(mr.is_none());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert_have_same_elements(
                vec![FootprintReasonCode::SsnDoesNotMatch],
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
                    FootprintReasonCode::DobMatches,
                    FootprintReasonCode::SsnDoesNotMatch, // does not match
                    FootprintReasonCode::NameLastMatches,
                    FootprintReasonCode::NameMatches,
                    FootprintReasonCode::IpStateMatches,
                    FootprintReasonCode::PhoneNumberMatches,
                    FootprintReasonCode::InputPhoneNumberMatchesInputState,
                    FootprintReasonCode::InputPhoneNumberMatchesLocatedStateHistory,
                ],
                rs.into_iter().map(|rs| rs.reason_code).collect_vec(),
            );
        }
    };

    // Test Redo as well
    match user_kind {
        // TODO: we don't really currently provide a way to specicfy fixtures for a Redo flow
        UserKind::Demo | UserKind::Sandbox(_) => {}
        UserKind::Live => {
            redo_and_pass(state, user_kind, &ob, &obd, &tenant.id, &obc.key).await;
        }
    }
}

async fn redo_and_pass(
    state: &mut State,
    user_kind: UserKind,
    prior_ob: &Onboarding,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
    ob_config_key: &ObConfigurationKey,
) {
    // Trigger Redo workflow
    let sv_id = prior_ob.scoped_vault_id.clone();
    let wf = state
        .db_pool
        .db_query(move |conn| {
            Workflow::create(conn, &sv_id, AlpacaKycConfig { is_redo: true }.into()).unwrap()
        })
        .await
        .unwrap();

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant_id.clone();
    mock_ff_client
        .expect_flag()
        .times(3)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = ob_config_key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(state, WithQualifier(None));
            mock_twilio(state);
            mock_incode(state, WithHit(false));
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
    let ww: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert!(obd.status == DecisionStatus::Pass);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Pass, ob.status);
    // redo flow hasn't modified timestamps on ob
    assert!(prior_ob.authorized_at == ob.authorized_at);
    assert!(prior_ob.idv_reqs_initiated_at == ob.idv_reqs_initiated_at);
    assert!(prior_ob.decision_made_at == ob.decision_made_at);
}
