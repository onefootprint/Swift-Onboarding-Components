use crate::auth::tenant::AuthActor;
use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_incode, mock_incode_doc_collection, mock_webhooks, query_data, query_risk_signals,
    setup_data, AmlKind, DocumentOutcome, ExpectedRequiresManualReview, ExpectedStatus, OnboardingCompleted,
    OnboardingStatusChanged, UserKind, WithHit, WithQualifier,
};
use crate::decision::state::MakeDecision;
use crate::decision::state::MakeWatchlistCheckCall;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowWrapper;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::models::tenant_user::TenantUser;
use diesel::prelude::*;

use crate::{decision::state::alpaca_kyc::*, State};
use api_wire_types::{CreateAnnotationRequest, DecisionRequest, TerminalDecisionStatus};

use db::models::onboarding_decision::OnboardingDecision;

use db::models::workflow::{NewWorkflowArgs, Workflow};

use db::test_helpers::assert_have_same_elements;

use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db_schema::schema::workflow;
use feature_flag::BoolFlag;

use feature_flag::MockFeatureFlagClient;

use itertools::Itertools;
use macros::test_state_case;
use newtypes::{
    AlpacaKycConfig, AlpacaKycState, CipKind, DbActor, DecisionStatus, KycConfig, KycState, ReviewReason,
    VendorAPI, WorkflowSource,
};
use newtypes::{EnhancedAmlOption, OnboardingStatus};
use newtypes::{FootprintReasonCode, RiskSignalGroupKind, WorkflowFixtureResult};

use newtypes::WorkflowState;

use std::sync::Arc;

#[derive(Clone, Copy)]
enum WFKind {
    Alpaca,
    Kyc,
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

// The current get_or_start_onboarding will create an AlpacaKyc WF if obc.cip_kind = alpaca. For now, we'll keep this code path in tact but do this hack here in the test
// to manually set the Workflow to be a regular Kyc WF so we can test replicating AlpacaKyc functionality in the existing Kyc WF
async fn set_workflow_to_kyc_kind(state: &State, wf: Workflow) -> Workflow {
    let wf_id = wf.id.clone();
    state
        .db_pool
        .db_query(move |conn| {
            diesel::update(workflow::table)
                .filter(workflow::id.eq(wf_id))
                .set((
                    workflow::kind.eq(newtypes::WorkflowKind::Kyc),
                    workflow::state.eq(newtypes::WorkflowState::Kyc(newtypes::KycState::DataCollection)),
                    workflow::config.eq(newtypes::WorkflowConfig::Kyc(newtypes::KycConfig {
                        is_redo: false,
                    })),
                ))
                .get_result(conn)
                .unwrap()
        })
        .await
        .unwrap()
}

async fn setup(
    state: &State,
    wf_kind: WFKind,
    obc_opts: ObConfigurationOpts,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Workflow, Tenant, ObConfiguration, TenantUser) {
    let (wf, tenant, obc, tu) = setup_data(state, obc_opts, fixture_result).await;

    let wf = match wf_kind {
        WFKind::Alpaca => wf,
        WFKind::Kyc => set_workflow_to_kyc_kind(state, wf).await,
    };
    (wf, tenant, obc, tu)
}

#[test_state_case(WFKind::Alpaca, UserKind::Demo)]
#[test_state_case(WFKind::Alpaca, UserKind::Sandbox(WorkflowFixtureResult::Pass))]
#[test_state_case(WFKind::Alpaca, UserKind::Live)]
#[test_state_case(WFKind::Kyc, UserKind::Demo)]
#[test_state_case(WFKind::Kyc, UserKind::Sandbox(WorkflowFixtureResult::Pass))]
#[test_state_case(WFKind::Kyc, UserKind::Live)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn pass(state: &mut State, wf_kind: WFKind, user_kind: UserKind) {
    // DATA SETUP
    let (wf, tenant, _obc, _tu) = setup(
        state,
        wf_kind,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            cip_kind: Some(CipKind::Alpaca),
            enhanced_aml: enhanced_aml_option_yes(),
            ..Default::default()
        },
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
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| {
                    matches!(
                        &f,
                        BoolFlag::EnableIdologyInNonProd(_)
                            | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                    )
                })
                .return_const(true);

            // TODO: fix this up later sorry in a rush
            mock_ff_client
                .expect_flag()
                .times(1)
                .withf(move |f| matches!(f, BoolFlag::IsKycWaterfallOnRuleFailureEnabled(_)))
                .return_const(false);

            mock_idology(state, WithQualifier(None));
            mock_incode(state, WithHit(vec![]))
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

    let (wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());

    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state),
    }
    assert!(!fps.is_empty()); //fingerprints were written

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| !r.hidden));

    // MakeDecision
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
    );

    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    match wf_kind {
        WFKind::Kyc => {} // KYC Workflow will have gone from MakeDecision -> Complete
        WFKind::Alpaca => {
            // For Alpaca, we need to run the MakeWatchlistCheckCall action next, then it will proceed to Complete
            let (_, _, mr, obd, _, _) = query_data(state, &svid, &wfid).await;
            // Assert no OBD is created yet and ob status is pending
            assert!(obd.is_none());
            assert_eq!(OnboardingStatus::Pending, wf.status.unwrap());
            assert!(mr.is_none());

            let (_, _) = ww
                .action(
                    state,
                    WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall {}),
                )
                .await
                .unwrap();
        }
    }

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state),
    }
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
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    };
}

#[test_state_case(WFKind::Alpaca, UserKind::Live, TerminalDecisionStatus::Pass)]
#[test_state_case(WFKind::Alpaca, UserKind::Live, TerminalDecisionStatus::Fail)]
#[test_state_case(
    WFKind::Alpaca,
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    TerminalDecisionStatus::Pass
)]
#[test_state_case(
    WFKind::Alpaca,
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    TerminalDecisionStatus::Fail
)]
#[test_state_case(WFKind::Kyc, UserKind::Live, TerminalDecisionStatus::Pass)]
#[test_state_case(WFKind::Kyc, UserKind::Live, TerminalDecisionStatus::Fail)]
#[test_state_case(
    WFKind::Kyc,
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    TerminalDecisionStatus::Pass
)]
#[test_state_case(
    WFKind::Kyc,
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    TerminalDecisionStatus::Fail
)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn pass_then_watchlist_hit(
    state: &mut State,
    wf_kind: WFKind,
    user_kind: UserKind,
    review_decision: TerminalDecisionStatus,
) {
    // DATA SETUP
    let (wf, tenant, _obc, tu) = setup(
        state,
        wf_kind,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            cip_kind: Some(CipKind::Alpaca),
            enhanced_aml: enhanced_aml_option_yes(),
            ..Default::default()
        },
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
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| {
                    matches!(
                        &f,
                        BoolFlag::EnableIdologyInNonProd(_)
                            | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                    )
                })
                .return_const(true);

            // TODO: fix this up later sorry in a rush
            mock_ff_client
                .expect_flag()
                .times(1)
                .withf(move |f| matches!(f, BoolFlag::IsKycWaterfallOnRuleFailureEnabled(_)))
                .return_const(false);

            mock_idology(state, WithQualifier(None));
            mock_incode(state, WithHit(vec![AmlKind::Ofac, AmlKind::Am]));
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

    let (wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state),
    }
    assert!(!fps.is_empty()); //fingerprints were written

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| !r.hidden));

    // MakeDecision

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Fail))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(true),
        )],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let ww = match wf_kind {
        WFKind::Kyc => ww, // KYC Workflow will have gone from MakeDecision -> Complete
        WFKind::Alpaca => {
            // For Alpaca, we need to run the MakeWatchlistCheckCall action next, then it will proceed to Complete

            let (_, _, mr, obd, _, _) = query_data(state, &svid, &wfid).await;
            // Assert no OBD is created yet and ob status is pending

            assert_eq!(OnboardingStatus::Pending, wf.status.unwrap());
            assert!(obd.is_none());
            assert!(mr.is_none());
            // Some risk signals are unhidden now
            let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
            assert!(!rs.is_empty());
            assert!(rs.iter().all(|r| !r.hidden));

            // MakeWatchlistCheckCall
            let (ww, _) = ww
                .action(
                    state,
                    WorkflowActions::MakeWatchlistCheckCall(MakeWatchlistCheckCall {}),
                )
                .await
                .unwrap();
            ww
        }
    };

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::PendingReview), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state),
    }
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
    // if non-sandbox, we should have portabalized data
    match user_kind {
        UserKind::Demo | UserKind::Live => assert!(obd.unwrap().seqno.is_some()),
        UserKind::Sandbox(_) => assert!(obd.unwrap().seqno.is_none()),
    }

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
            (VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches),
            (VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches),
            (VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches),
            (VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches),
        ],
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );

    // ReviewCompleted
    // For the AlpacaKyc workflow, we have a PendingReview state that the WF remains in until the review is completed./
    // For the regular Kyc workflow, we will continue to have no such state and instead just produce the review and have it completed without involvement of the workflow
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

    let review_decision_req = DecisionRequest {
        annotation: CreateAnnotationRequest {
            note: "yo".to_owned(),
            is_pinned: false,
        },
        status: review_decision,
    };
    let review_actor = AuthActor::TenantUser(tu.id);
    match wf_kind {
        WFKind::Kyc => {
            let wfid = wf.id.clone();
            state
                .db_pool
                // TODO how does this work when there are multiple KYC workflows for one scoped vault?
                .db_transaction(move |conn| -> ApiResult<_> {
                    let wf = Workflow::lock(conn, &wfid)?;
                    crate::decision::review::save_review_decision(conn, wf, review_decision_req, review_actor)?;
                    Ok(())
                })
                .await.unwrap();
            crate::task::execute_webhook_tasks(state.clone());
        }
        WFKind::Alpaca => {
            let (_, _) = ww
                .action(
                    state,
                    WorkflowActions::ReviewCompleted(crate::decision::state::ReviewCompleted {
                        decision: review_decision_req,
                        actor: review_actor,
                    }),
                )
                .await
                .unwrap();
        }
    }

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state),
    }
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
                    redo_and_pass(state, wf_kind, user_kind, &wf, &obd.unwrap(), &tenant.id).await;
                }
            }
        }
    }
}

#[test_state_case(WFKind::Alpaca, UserKind::Live)]
#[test_state_case(WFKind::Alpaca, UserKind::Sandbox(WorkflowFixtureResult::StepUp))]
// TODO: turn these on when Kyc workflow can support stepup
// #[test_state_case(WFKind::Kyc, UserKind::Live)]
// #[test_state_case(WFKind::Kyc, UserKind::Sandbox(WorkflowFixtureResult::StepUp))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn step_up(state: &mut State, wf_kind: WFKind, user_kind: UserKind) {
    // DATA SETUP
    let (wf, tenant, _obc, tu) = setup(
        state,
        wf_kind,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            cip_kind: Some(CipKind::Alpaca),
            enhanced_aml: enhanced_aml_option_yes(),
            ..Default::default()
        },
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
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            mock_incode_doc_collection(state, svid2, DocumentOutcome::Success, wfid.clone(), false).await;
        }
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| {
                    matches!(
                        &f,
                        BoolFlag::EnableIdologyInNonProd(_)
                            | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                    )
                })
                .return_const(true);

            // TODO: fix this up later sorry in a rush
            mock_ff_client
                .expect_flag()
                .times(1)
                .withf(move |f| matches!(f, BoolFlag::IsKycWaterfallOnRuleFailureEnabled(_)))
                .return_const(false);

            mock_idology(
                state,
                WithQualifier(Some("resultcode.first.name.does.not.match".to_owned())),
            );
            mock_incode(state, WithHit(vec![]));
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

    let (wf, _, mr, obd, _, fps) = query_data(state, &svid, &wfid).await;
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

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::PendingReview), wf.state);
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
    let obd = obd.unwrap();
    // if non-sandbox, we should have portabalized data
    match user_kind {
        UserKind::Demo | UserKind::Live => assert!(obd.seqno.is_some()),
        UserKind::Sandbox(_) => assert!(obd.seqno.is_none()),
    }

    // manual_review should exist and have correct review_reasons
    let mr = mr.unwrap();
    assert_eq!(vec![ReviewReason::Document], mr.review_reasons);

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert!(rs.iter().all(|rs| matches!(
                rs.vendor_api,
                VendorAPI::IdologyExpectId | VendorAPI::IncodeFetchScores
            )));
            assert!(rs
                .iter()
                .any(|rs| rs.reason_code == FootprintReasonCode::SsnMatches));
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (
                        VendorAPI::IdologyExpectId,
                        FootprintReasonCode::NamePartiallyMatches,
                    ),
                    (
                        VendorAPI::IdologyExpectId,
                        FootprintReasonCode::NameFirstDoesNotMatch,
                    ),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches),
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

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state);
    assert!(mr.is_none()); // kinda weird but Onboarding::get returns only the current active review and now the review has been completed
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());
    let obd = obd.unwrap();
    assert!(matches!(obd.actor, DbActor::TenantUser { id: _ }));
    // this OBD since it's from a review, does not commit
    assert!(obd.seqno.is_none());

    assert!(!rs.is_empty()); // sanity check since we made a new OBD
}

#[test_state_case(WFKind::Alpaca, UserKind::Sandbox(WorkflowFixtureResult::Fail))]
#[test_state_case(WFKind::Alpaca, UserKind::Live)]
#[test_state_case(WFKind::Kyc, UserKind::Sandbox(WorkflowFixtureResult::Fail))]
#[test_state_case(WFKind::Kyc, UserKind::Live)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn fail(state: &mut State, wf_kind: WFKind, user_kind: UserKind) {
    // DATA SETUP
    let (wf, tenant, _obc, _tu) = setup(
        state,
        wf_kind,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            cip_kind: Some(CipKind::Alpaca),
            enhanced_aml: enhanced_aml_option_yes(),
            ..Default::default()
        },
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
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| {
                    matches!(
                        &f,
                        BoolFlag::EnableIdologyInNonProd(_)
                            | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                    )
                })
                .return_const(true);

            // TODO: fix this up later sorry in a rush
            mock_ff_client
                .expect_flag()
                .times(1)
                .withf(move |f| matches!(f, BoolFlag::IsKycWaterfallOnRuleFailureEnabled(_)))
                .return_const(false);

            mock_idology(
                state,
                WithQualifier(Some("resultcode.ssn.does.not.match".to_owned())),
            );

            // the AlpacaKyc workflow currently does not make the watchlist call if there is a "hard fail". But the Kyc workflow will always make the call alongside the other Kyc calls
            match wf_kind {
                WFKind::Kyc => mock_incode(state, WithHit(vec![])),
                WFKind::Alpaca => {}
            }
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

    let (wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    match wf_kind {
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state),
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state),
    }
    assert!(!fps.is_empty()); //fingerprints were written

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();
    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| !r.hidden));

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

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state),
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state),
    }
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Fail);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert!(obd.seqno.is_none());
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
    assert!(mr.is_none());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert_have_same_elements(
                vec![(VendorAPI::IdologyExpectId, FootprintReasonCode::SsnDoesNotMatch)],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::SsnDoesNotMatch), // does not match
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches),
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
            redo_and_pass(state, wf_kind, user_kind, &wf, &obd, &tenant.id).await;
        }
    }
}

async fn redo_and_pass(
    state: &mut State,
    wf_kind: WFKind,
    user_kind: UserKind,
    prior_wf: &Workflow,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
) {
    // Trigger Redo workflow
    let sv_id = prior_wf.scoped_vault_id.clone();
    let fixture_result = prior_wf.fixture_result;
    let obc_id = prior_wf.ob_configuration_id.clone();
    let wf = state
        .db_pool
        .db_transaction(move |conn| {
            let config = match wf_kind {
                WFKind::Alpaca => AlpacaKycConfig { is_redo: true }.into(),
                WFKind::Kyc => KycConfig { is_redo: true }.into(),
            };
            let args = NewWorkflowArgs {
                scoped_vault_id: sv_id,
                config,
                fixture_result,
                ob_configuration_id: obc_id,
                insight_event_id: None,
                authorized: false,
                source: WorkflowSource::Hosted,
            };
            Workflow::create(conn, args)
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
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| {
                    matches!(
                        &f,
                        BoolFlag::EnableIdologyInNonProd(_)
                            | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                    )
                })
                .return_const(true);

            // TODO: fix this up later sorry in a rush
            mock_ff_client
                .expect_flag()
                .times(1)
                .withf(move |f| matches!(f, BoolFlag::IsKycWaterfallOnRuleFailureEnabled(_)))
                .return_const(false);

            mock_idology(state, WithQualifier(None));
            mock_incode(state, WithHit(vec![]));
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
    );

    let _: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, _, obd, rs, _) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state),
    }
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert!(obd.status == DecisionStatus::Pass);
    assert!(obd.seqno.is_some());
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());

    assert_have_same_elements(
        vec![
            (VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches),
            (VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches),
            (VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches),
            (VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches),
        ],
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );
}
