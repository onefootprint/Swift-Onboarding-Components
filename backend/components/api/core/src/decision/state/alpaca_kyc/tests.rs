use crate::auth::tenant::AuthActor;
use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_incode, mock_incode_doc_collection, mock_webhooks, query_data, query_risk_signals,
    setup_data, DocumentOutcome, ExpectedRequiresManualReview, ExpectedStatus, OnboardingCompleted,
    OnboardingStatusChanged, UserKind, WithHit, WithQualifier,
};
use crate::decision::state::MakeDecision;
use crate::decision::state::MakeWatchlistCheckCall;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowWrapper;

use crate::{decision::state::alpaca_kyc::*, State};
use api_wire_types::{CreateAnnotationRequest, DecisionRequest, TerminalDecisionStatus};

use db::models::onboarding_decision::OnboardingDecision;

use db::models::workflow::{NewWorkflowArgs, Workflow};

use db::test_helpers::assert_have_same_elements;

use feature_flag::BoolFlag;

use feature_flag::MockFeatureFlagClient;

use itertools::Itertools;
use macros::test_state_case;
use newtypes::OnboardingStatus;
use newtypes::{
    AlpacaKycConfig, AlpacaKycState, CipKind, DbActor, DecisionStatus, ObConfigurationKey, ReviewReason,
    VendorAPI,
};
use newtypes::{FootprintReasonCode, RiskSignalGroupKind, WorkflowFixtureResult};

use newtypes::WorkflowState;

use std::sync::Arc;

#[test_state_case(UserKind::Demo)]
#[test_state_case(UserKind::Sandbox(WorkflowFixtureResult::Pass))]
#[test_state_case(UserKind::Live)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn pass(state: &mut State, user_kind: UserKind) {
    // DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(
        state,
        user_kind,
        Some(CipKind::Alpaca),
        user_kind.fixture_result(),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    mock_ff_client
        .expect_flag()
        .times(4)
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
            mock_incode(state, WithHit(false));
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    // TESTS
    //
    // Authorize
    // Expect webhook
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending))],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (_, wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state);
    assert!(!fps.is_empty()); //fingerprints were written

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| r.hidden));

    // MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (_, _, _, mr, obd, _, _) = query_data(state, &svid, &wfid).await;
    // Assert no OBD is created yet and ob status is pending
    assert!(obd.is_none());
    assert_eq!(OnboardingStatus::Pending, wf.status.unwrap());
    assert!(mr.is_none());

    // MakeWatchlistCheckCall
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
    );
    let (_, _) = ww
        .action(
            state,
            WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall {}),
        )
        .await
        .unwrap();

    let (_, wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Pass);
    assert!(obd.seqno.is_some());
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert!(mr.is_none());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    };
}

#[test_state_case(UserKind::Live, TerminalDecisionStatus::Pass)]
#[test_state_case(UserKind::Live, TerminalDecisionStatus::Fail)]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    TerminalDecisionStatus::Pass
)]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    TerminalDecisionStatus::Fail
)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn pass_then_watchlist_hit(
    state: &mut State,
    user_kind: UserKind,
    review_decision: TerminalDecisionStatus,
) {
    // DATA SETUP
    let (wf, tenant, obc, tu) = setup_data(
        state,
        user_kind,
        Some(CipKind::Alpaca),
        user_kind.fixture_result(),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .times(4)
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
            mock_incode(state, WithHit(true));
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    // TESTS
    //
    // Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending))],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (_, wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state);
    assert!(!fps.is_empty()); //fingerprints were written

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| r.hidden));

    // MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (_, _, _, mr, obd, _, _) = query_data(state, &svid, &wfid).await;
    // Assert no OBD is created yet and ob status is pending

    assert_eq!(OnboardingStatus::Pending, wf.status.unwrap());
    assert!(obd.is_none());
    assert!(mr.is_none());
    // Some risk signals are unhidden now
    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| !r.hidden));

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Fail))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(true),
        )],
    );

    // MakeWatchlistCheckCall
    let (ww, _) = ww
        .action(
            state,
            WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall {}),
        )
        .await
        .unwrap();

    let (_, wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::PendingReview), wf.state);
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
    // we commit in this case
    assert!(obd.unwrap().seqno.is_some());
    // manual_review should exist and have correct review_reasons
    let mr = mr.unwrap();
    assert_eq!(
        vec![ReviewReason::AdverseMediaHit, ReviewReason::WatchlistHit],
        mr.review_reasons
    );

    assert_have_same_elements(
        vec![
            (
                VendorAPI::IncodeWatchlistCheck,
                FootprintReasonCode::WatchlistHitOfac,
            ),
            (
                VendorAPI::IncodeWatchlistCheck,
                FootprintReasonCode::AdverseMediaHit,
            ),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
        ],
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );

    // ReviewCompleted
    // Expect Webhooks
    match review_decision {
        TerminalDecisionStatus::Pass => {
            mock_webhooks(
                state,
                vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
                vec![],
            );
        }
        // users status isn't changing, so no webhook
        TerminalDecisionStatus::Fail => {}
    }

    let (_, _) = ww
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

    let (_, wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    assert!(mr.is_none()); // kinda weird but Onboarding::get returns only the current active review and now the review has been completed
    match review_decision {
        TerminalDecisionStatus::Pass => {
            assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());
            assert!(matches!(obd.unwrap().actor, DbActor::TenantUser { id: _ }));
            assert!(!rs.is_empty()); // sanity check since we made a new OBD
        }
        TerminalDecisionStatus::Fail => {
            assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());

            // Test Redo as well
            match user_kind {
                // TODO: we don't really currently provide a way to specicfy fixtures for a Redo flow
                UserKind::Demo | UserKind::Sandbox(_) => {}
                UserKind::Live => {
                    redo_and_pass(state, user_kind, &wf, &obd.unwrap(), &tenant.id, &obc.key).await;
                }
            }
        }
    }
}

#[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox(WorkflowFixtureResult::StepUp))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn step_up(state: &mut State, user_kind: UserKind) {
    // DATA SETUP
    let (wf, tenant, obc, tu) = setup_data(
        state,
        user_kind,
        Some(CipKind::Alpaca),
        user_kind.fixture_result(),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let svid2 = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    mock_ff_client
        .expect_flag()
        .times(4)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            mock_incode_doc_collection(state, svid2, DocumentOutcome::Success, wfid.clone(), false).await;
        }
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
                WithQualifier(Some("resultcode.first.name.does.not.match".to_owned())),
            );
            mock_incode(state, WithHit(false));
            mock_incode_doc_collection(state, svid2, DocumentOutcome::Success, wfid.clone(), false).await;
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    // TESTS
    //
    // Authorize
    // Expect Webhook
    mock_webhooks(
        state,
        vec![
            OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending)),
            OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Incomplete)),
        ],
        vec![],
    );
    let ww: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (_, wf, _, mr, obd, _, fps) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::DocCollection), wf.state);
    assert!(wf.authorized_at.is_some());
    // Assert no OBD is created yet and ob status is pending
    assert!(obd.is_none());
    assert_eq!(OnboardingStatus::Incomplete, wf.status.unwrap());
    assert!(mr.is_none());
    assert!(!fps.is_empty()); //fingerprints were written

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Fail))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(true),
        )],
    );

    // DocCollected
    let ww = ww
        .run(
            state,
            WorkflowActions::DocCollected(crate::decision::state::DocCollected {}),
        )
        .await
        .unwrap();

    let (_, wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::PendingReview), wf.state);
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
    let obd = obd.unwrap();
    assert!(obd.seqno.is_some());
    // manual_review should exist and have correct review_reasons
    let mr = mr.unwrap();
    assert_eq!(vec![ReviewReason::Document], mr.review_reasons);

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert!(rs.iter().all(|rs| matches!(
                rs.vendor_api,
                VendorAPI::IdologyExpectID | VendorAPI::IncodeFetchScores
            )));
            assert!(rs
                .iter()
                .any(|rs| rs.reason_code == FootprintReasonCode::SsnMatches));
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (
                        VendorAPI::IdologyExpectID,
                        FootprintReasonCode::NamePartiallyMatches,
                    ),
                    (
                        VendorAPI::IdologyExpectID,
                        FootprintReasonCode::NameFirstDoesNotMatch,
                    ),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
                    (
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentVerified,
                    ),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    }

    // ReviewCompleted
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![],
    );
    let (_, _) = ww
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

    let (_, wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    assert!(mr.is_none()); // kinda weird but Onboarding::get returns only the current active review and now the review has been completed
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());
    let obd = obd.unwrap();
    assert!(matches!(obd.actor, DbActor::TenantUser { id: _ }));
    // this OBD since it's from a review, does not commit
    assert!(obd.seqno.is_none());

    assert!(!rs.is_empty()); // sanity check since we made a new OBD
}

#[test_state_case(UserKind::Sandbox(WorkflowFixtureResult::Fail))]
#[test_state_case(UserKind::Live)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn fail(state: &mut State, user_kind: UserKind) {
    // DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(
        state,
        user_kind,
        Some(CipKind::Alpaca),
        user_kind.fixture_result(),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
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

            mock_idology(
                state,
                WithQualifier(Some("resultcode.ssn.does.not.match".to_owned())),
            );
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    // TESTS
    //
    // Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending))],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (_, wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state);
    assert!(!fps.is_empty()); //fingerprints were written

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();
    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| r.hidden));

    // Expect Webhook
    let _expect_review = match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => false,
        UserKind::Live => {
            // TODO: this is wrong! When we add proper Alpaca rules then we should not be raising a review
            true
        }
    };

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Fail))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(false),
        )],
    );

    // MakeDecision
    let (_, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (_, wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Fail);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert!(obd.seqno.is_none());
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
    assert!(mr.is_none());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert_have_same_elements(
                vec![(VendorAPI::IdologyExpectID, FootprintReasonCode::SsnDoesNotMatch)],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnDoesNotMatch), // does not match
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    };

    // Test Redo as well
    match user_kind {
        // TODO: we don't really currently provide a way to specicfy fixtures for a Redo flow
        UserKind::Demo | UserKind::Sandbox(_) => {}
        UserKind::Live => {
            redo_and_pass(state, user_kind, &wf, &obd, &tenant.id, &obc.key).await;
        }
    }
}

async fn redo_and_pass(
    state: &mut State,
    user_kind: UserKind,
    prior_wf: &Workflow,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
    ob_config_key: &ObConfigurationKey,
) {
    // Trigger Redo workflow
    let sv_id = prior_wf.scoped_vault_id.clone();
    let fixture_result = prior_wf.fixture_result;
    let obc_id = prior_wf.ob_configuration_id.clone();
    let wf = state
        .db_pool
        .db_query(move |conn| {
            let args = NewWorkflowArgs {
                scoped_vault_id: sv_id,
                config: AlpacaKycConfig { is_redo: true }.into(),
                fixture_result,
                ob_configuration_id: obc_id,
                insight_event_id: None,
            };
            Workflow::create(conn, args).unwrap()
        })
        .await
        .unwrap();

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant_id.clone();
    mock_ff_client
        .expect_flag()
        .times(4)
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
            mock_incode(state, WithHit(false));
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![],
    );

    let _: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (_, wf, _, _, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert!(obd.status == DecisionStatus::Pass);
    assert!(obd.seqno.is_some());
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());

    assert_have_same_elements(
        vec![
            (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
        ],
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );
}
