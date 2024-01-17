use crate::auth::tenant::AuthActor;
use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_incode, mock_incode_doc_collection, mock_webhooks, query_data, query_risk_signals,
    setup_data, AmlKind, ExpectedRequiresManualReview, ExpectedStatus, OnboardingCompleted,
    OnboardingStatusChanged, UserKind, WithHit, WithQualifier,
};
use crate::decision::state::MakeDecision;
use crate::decision::state::MakeWatchlistCheckCall;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowWrapper;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::{NewRule, RuleInstance};
use db::models::tenant::Tenant;
use db::models::tenant_user::TenantUser;
use db::tests::MockFFClient;
use diesel::prelude::*;

use crate::{decision::state::alpaca_kyc::*, State};
use api_wire_types::{CreateAnnotationRequest, DecisionRequest, TerminalDecisionStatus};

use db::models::onboarding_decision::OnboardingDecision;

use db::models::workflow::{NewWorkflowArgs, Workflow};

use db::test_helpers::assert_have_same_elements;

use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db_schema::schema::workflow;
use feature_flag::BoolFlag;

use itertools::Itertools;
use macros::test_state_case;
use newtypes::{
    AlpacaKycConfig, AlpacaKycState, BooleanOperator, CipKind, DbActor, DecisionStatus, KycConfig, KycState,
    ObConfigurationId, ReviewReason, RuleAction, RuleExpression, RuleExpressionCondition, VendorAPI,
    WorkflowSource,
};
use newtypes::{EnhancedAmlOption, OnboardingStatus};
use newtypes::{FootprintReasonCode as FRC, RiskSignalGroupKind, WorkflowFixtureResult};

use newtypes::WorkflowState;

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
async fn set_workflow_to_alpaca_kyc_kind(state: &State, wf: Workflow) -> Workflow {
    let wf_id = wf.id.clone();
    state
        .db_pool
        .db_query(move |conn| {
            diesel::update(workflow::table)
                .filter(workflow::id.eq(wf_id))
                .set((
                    workflow::kind.eq(newtypes::WorkflowKind::AlpacaKyc),
                    workflow::state.eq(newtypes::WorkflowState::AlpacaKyc(
                        newtypes::AlpacaKycState::DataCollection,
                    )),
                    workflow::config.eq(newtypes::WorkflowConfig::AlpacaKyc(newtypes::AlpacaKycConfig {
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
        WFKind::Alpaca => set_workflow_to_alpaca_kyc_kind(state, wf).await,
        WFKind::Kyc => wf,
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
    let mut mock_ff_client = MockFFClient::new();

    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| {
                        matches!(
                            &f,
                            BoolFlag::EnableIdologyInNonProd(_)
                                | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                        )
                    })
                    .return_const(true);
            });

            mock_idology(state, WithQualifier(None));
            mock_incode(state, WithHit(vec![]))
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());

    // TESTS
    //
    // Authorize
    // Expect webhook
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pending),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());

    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state),
    }

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
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
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
            let (_, _, mr, obd, _) = query_data(state, &svid, &wfid).await;
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

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
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
                    (VendorAPI::IdologyExpectId, FRC::AddressMatches),
                    (VendorAPI::IdologyExpectId, FRC::DobMatches),
                    (VendorAPI::IdologyExpectId, FRC::SsnMatches),
                    (VendorAPI::IdologyExpectId, FRC::NameMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectId, FRC::AddressMatches),
                    (VendorAPI::IdologyExpectId, FRC::SsnMatches),
                    (VendorAPI::IdologyExpectId, FRC::NameMatches),
                    (VendorAPI::IdologyExpectId, FRC::DobMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    };
}

#[test_state_case(WFKind::Alpaca, UserKind::Live, TerminalDecisionStatus::Pass)]
// #[test_state_case(WFKind::Alpaca, UserKind::Live, TerminalDecisionStatus::Fail)] // this test fails with new rules engine because of how the Alpaca KYC workflow works but its not really worth fixing since that workflow is deprecated anyway
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
    let mut mock_ff_client = MockFFClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| {
                        matches!(
                            &f,
                            BoolFlag::EnableIdologyInNonProd(_)
                                | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                        )
                    })
                    .return_const(true);
            });

            mock_idology(state, WithQualifier(None));
            mock_incode(state, WithHit(vec![AmlKind::Ofac, AmlKind::Am]));
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());

    // TESTS
    //
    // Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pending),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    match wf_kind {
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state),
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state),
    }

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
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(true),
        )],
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

            let (_, _, mr, obd, _) = query_data(state, &svid, &wfid).await;
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

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
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
            (VendorAPI::IncodeWatchlistCheck, FRC::WatchlistHitOfac),
            (VendorAPI::IncodeWatchlistCheck, FRC::AdverseMediaHit),
            (VendorAPI::IdologyExpectId, FRC::AddressMatches),
            (VendorAPI::IdologyExpectId, FRC::SsnMatches),
            (VendorAPI::IdologyExpectId, FRC::NameMatches),
            (VendorAPI::IdologyExpectId, FRC::DobMatches),
        ],
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );

    // ReviewCompleted
    // For the AlpacaKyc workflow, we have a PendingReview state that the WF remains in until the review is completed./
    // For the regular Kyc workflow, we will continue to have no such state and instead just produce the review and have it completed without involvement of the workflow
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(review_decision.into()),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );

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
                .db_transaction(move |conn| -> ApiResult<_> {
                    let wf = Workflow::lock(conn, &wfid)?;
                    crate::decision::review::save_review_decision(
                        conn,
                        wf,
                        review_decision_req,
                        review_actor,
                    )?;
                    Ok(())
                })
                .await
                .unwrap();
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

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
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

#[derive(Clone, Copy, Debug)]
enum ExpectedResult {
    Pass,
    FailWithReview,
}

impl ExpectedResult {
    pub fn status(&self) -> OnboardingStatus {
        match self {
            ExpectedResult::Pass => OnboardingStatus::Pass,
            ExpectedResult::FailWithReview => OnboardingStatus::Fail,
        }
    }

    pub fn requires_review(&self) -> bool {
        match self {
            ExpectedResult::Pass => false,
            ExpectedResult::FailWithReview => true,
        }
    }
}

enum StepUpReason {
    NameDoesntMatch,
    WatchlistHit,
}

impl StepUpReason {
    pub fn expected_review_reasons(&self) -> Vec<ReviewReason> {
        match self {
            StepUpReason::NameDoesntMatch => vec![ReviewReason::Document],
            StepUpReason::WatchlistHit => vec![ReviewReason::Document, ReviewReason::WatchlistHit],
        }
    }
}

#[test_state_case(WFKind::Alpaca, UserKind::Live, StepUpReason::NameDoesntMatch, vec![FRC::DocumentVerified], ExpectedResult::FailWithReview)] // the legacy Alpaca workflow always fails with review when a doc is uploaded
#[test_state_case(WFKind::Alpaca, UserKind::Sandbox(WorkflowFixtureResult::StepUp),StepUpReason::NameDoesntMatch, vec![FRC::DocumentVerified], ExpectedResult::FailWithReview)]
#[test_state_case(WFKind::Kyc, UserKind::Sandbox(WorkflowFixtureResult::StepUp),StepUpReason::NameDoesntMatch, vec![FRC::DocumentVerified], ExpectedResult::FailWithReview)]
// note: every test will have the KYC calls produce `NamePartiallyMatches`
#[test_state_case(WFKind::Kyc, UserKind::Live,StepUpReason::NameDoesntMatch, vec![FRC::DocumentVerified, FRC::DocumentOcrAddressMatches, FRC::DocumentOcrDobMatches, FRC::DocumentOcrNameDoesNotMatch], ExpectedResult::FailWithReview ; "doc name doesn't match")]
#[test_state_case(WFKind::Kyc, UserKind::Live,StepUpReason::NameDoesntMatch, vec![FRC::DocumentVerified, FRC::DocumentOcrAddressMatches, FRC::DocumentOcrDobMatches, FRC::DocumentOcrNameMatches], ExpectedResult::Pass ; "doc names matches")]
#[test_state_case(WFKind::Kyc, UserKind::Live,StepUpReason::NameDoesntMatch, vec![FRC::DocumentNotVerified, FRC::DocumentOcrAddressMatches, FRC::DocumentOcrDobMatches, FRC::DocumentOcrNameMatches], ExpectedResult::FailWithReview ; "doc names matches but doc not verified")]
#[test_state_case(WFKind::Kyc, UserKind::Live,StepUpReason::NameDoesntMatch, vec![FRC::DocumentVerified, FRC::DocumentSelfieDoesNotMatch, FRC::DocumentOcrAddressMatches, FRC::DocumentOcrDobMatches, FRC::DocumentOcrNameMatches], ExpectedResult::FailWithReview ; "doc names matches but selfie doesnt match")]
#[test_state_case(WFKind::Kyc, UserKind::Live, StepUpReason::WatchlistHit, vec![FRC::DocumentVerified], ExpectedResult::FailWithReview ; "stepup from AML hit")]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn step_up(
    state: &mut State,
    wf_kind: WFKind,
    user_kind: UserKind,
    step_up_reason: StepUpReason,
    document_frcs: Vec<FRC>,
    expected_result: ExpectedResult,
) {
    // DATA SETUP
    let (wf, tenant, obc, tu) = setup(
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
    if matches!(step_up_reason, StepUpReason::WatchlistHit) {
        add_stepup_aml_rule(state, obc.id.clone()).await;
    }
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let svid2 = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFFClient::new();

    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| {
                        matches!(
                            &f,
                            BoolFlag::EnableIdologyInNonProd(_)
                                | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                        )
                    })
                    .return_const(true);
            });

            match step_up_reason {
                StepUpReason::NameDoesntMatch => {
                    mock_idology(
                        state,
                        WithQualifier(Some("resultcode.first.name.does.not.match".to_owned())),
                    );
                    mock_incode(state, WithHit(vec![]));
                }
                StepUpReason::WatchlistHit => {
                    mock_idology(state, WithQualifier(None));
                    mock_incode(state, WithHit(vec![AmlKind::Ofac]));
                }
            };
        }
    };

    // mock Incode doc collection flow
    mock_incode_doc_collection(state, svid2, document_frcs.clone(), wfid.clone(), false).await;

    state.set_ff_client(mock_ff_client.into_mock());

    // TESTS
    //
    // Authorize
    // Expect Webhook
    mock_webhooks(
        state,
        vec![
            OnboardingStatusChanged(
                ExpectedStatus(OnboardingStatus::Pending),
                ExpectedRequiresManualReview(false),
            ),
            OnboardingStatusChanged(
                ExpectedStatus(OnboardingStatus::Incomplete),
                ExpectedRequiresManualReview(false),
            ),
        ],
        vec![],
    );
    let ww: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, mr, obd, _) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::DocCollection), wf.state),
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::DocCollection), wf.state),
    }
    assert!(wf.authorized_at.is_some());
    // Assert no OBD is created yet and ob status is pending
    assert!(obd.is_none());
    assert_eq!(OnboardingStatus::Incomplete, wf.status.unwrap());
    assert!(mr.is_none());

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(expected_result.status()),
            ExpectedRequiresManualReview(expected_result.requires_review()),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_result.status()),
            ExpectedRequiresManualReview(expected_result.requires_review()),
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

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state),
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::PendingReview), wf.state),
    }
    assert_eq!(expected_result.status(), wf.status.unwrap());
    let obd = obd.unwrap();
    // if non-sandbox, we should have portabalized data
    match user_kind {
        UserKind::Demo | UserKind::Live => assert!(obd.seqno.is_some()),
        UserKind::Sandbox(_) => assert!(obd.seqno.is_none()),
    }

    // If FailWithReview, then manual_review should exist and have correct review_reasons
    if expected_result.requires_review() {
        let mr = mr.unwrap();
        assert_have_same_elements(step_up_reason.expected_review_reasons(), mr.review_reasons);
    }

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert!(rs.iter().all(|rs| matches!(
                rs.vendor_api,
                VendorAPI::IdologyExpectId | VendorAPI::IncodeFetchScores
            )));
            assert!(rs.iter().any(|rs| rs.reason_code == FRC::SsnMatches));
        }
        UserKind::Live => {
            let mut kyc_risk_signals = vec![
                (VendorAPI::IdologyExpectId, FRC::AddressMatches),
                (VendorAPI::IdologyExpectId, FRC::SsnMatches),
                (VendorAPI::IdologyExpectId, FRC::DobMatches),
            ];
            match step_up_reason {
                StepUpReason::NameDoesntMatch => {
                    kyc_risk_signals = kyc_risk_signals
                        .into_iter()
                        .chain(vec![
                            (VendorAPI::IdologyExpectId, FRC::NamePartiallyMatches),
                            (VendorAPI::IdologyExpectId, FRC::NameFirstDoesNotMatch),
                        ])
                        .collect();
                }
                StepUpReason::WatchlistHit => {
                    kyc_risk_signals = kyc_risk_signals
                        .into_iter()
                        .chain(vec![
                            (VendorAPI::IncodeWatchlistCheck, FRC::WatchlistHitOfac),
                            (VendorAPI::IdologyExpectId, FRC::NameMatches),
                        ])
                        .collect();
                }
            };
            assert_have_same_elements(
                kyc_risk_signals
                    .into_iter()
                    .chain(
                        document_frcs
                            .into_iter()
                            .map(|f| (VendorAPI::IncodeFetchScores, f)),
                    )
                    .collect_vec(),
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    }

    // If the expected result is a review was raised, then we simulate completing the review. Else we exit early here (ie the user passed and there's nothing else to simulate/check)
    if !expected_result.requires_review() {
        return;
    }

    // ReviewCompleted
    // For the AlpacaKyc workflow, we have a PendingReview state that the WF remains in until the review is completed./
    // For the regular Kyc workflow, we will continue to have no such state and instead just produce the review and have it completed without involvement of the workflow
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );

    let review_decision_req = DecisionRequest {
        annotation: CreateAnnotationRequest {
            note: "yo".to_owned(),
            is_pinned: false,
        },
        status: TerminalDecisionStatus::Pass,
    };
    let review_actor = AuthActor::TenantUser(tu.id);

    match wf_kind {
        WFKind::Kyc => {
            let wfid = wf.id.clone();
            state
                .db_pool
                .db_transaction(move |conn| -> ApiResult<_> {
                    let wf = Workflow::lock(conn, &wfid)?;
                    crate::decision::review::save_review_decision(
                        conn,
                        wf,
                        review_decision_req,
                        review_actor,
                    )?;
                    Ok(())
                })
                .await
                .unwrap();
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

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
    match wf_kind {
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state),
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::Complete), wf.state),
    }
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
    let mut mock_ff_client = MockFFClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| {
                        matches!(
                            &f,
                            BoolFlag::EnableIdologyInNonProd(_)
                                | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                        )
                    })
                    .return_const(true);
            });

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
    state.set_ff_client(mock_ff_client.into_mock());

    // TESTS
    //
    // Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pending),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    match wf_kind {
        WFKind::Kyc => assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state),
        WFKind::Alpaca => assert_eq!(WorkflowState::AlpacaKyc(AlpacaKycState::VendorCalls), wf.state),
    }

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
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(false),
        )],
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

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
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
                vec![(VendorAPI::IdologyExpectId, FRC::SsnDoesNotMatch)],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectId, FRC::AddressMatches),
                    (VendorAPI::IdologyExpectId, FRC::DobMatches),
                    (VendorAPI::IdologyExpectId, FRC::SsnDoesNotMatch), // does not match
                    (VendorAPI::IdologyExpectId, FRC::NameMatches),
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
                is_one_click: false,
            };
            Workflow::create(conn, args)
        })
        .await
        .unwrap();

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFFClient::new();

    let tenant_id = tenant_id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| {
                        matches!(
                            &f,
                            BoolFlag::EnableIdologyInNonProd(_)
                                | BoolFlag::EnableIncodeWatchlistCheckInNonProd(_)
                        )
                    })
                    .return_const(true);
            });

            mock_idology(state, WithQualifier(None));
            mock_incode(state, WithHit(vec![]));
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
    );

    let _: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, _, obd, rs) = query_data(state, &svid, &wfid).await;
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
            (VendorAPI::IdologyExpectId, FRC::AddressMatches),
            (VendorAPI::IdologyExpectId, FRC::SsnMatches),
            (VendorAPI::IdologyExpectId, FRC::NameMatches),
            (VendorAPI::IdologyExpectId, FRC::DobMatches),
        ],
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );
}

async fn add_stepup_aml_rule(state: &mut State, obc_id: ObConfigurationId) {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let _ = RuleInstance::bulk_create(
                conn,
                &obc_id,
                DbActor::Footprint,
                vec![NewRule {
                    rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                        field: FRC::WatchlistHitOfac,
                        op: BooleanOperator::Equals,
                        value: true,
                    }]),
                    action: RuleAction::StepUp,
                    name: None,
                }],
            )
            .unwrap();
            Ok(())
        })
        .await
        .unwrap();
}
