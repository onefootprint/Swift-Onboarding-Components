use crate::decision::onboarding::Decision;
use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::test_utils::{mock_middesk, query_data};
use crate::decision::state::test_utils::{
    mock_webhooks, ExpectedRequiresManualReview, ExpectedStatus, OnboardingCompleted, OnboardingStatusChanged,
};
use crate::decision::state::Authorize;
use crate::decision::state::BoKycCompleted;
use crate::decision::state::MakeVendorCalls;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::decision::state::{kyb, MakeDecision};
use crate::errors::ApiResult;
use crate::{decision::tests::test_helpers, State};
use api_wire_types::TerminalDecisionStatus;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::models::tenant::Tenant;
use db::models::workflow::Workflow as DbWorkflow;
use db::tests::test_db_pool::TestDbPool;
use db::DbResult;
use feature_flag::BoolFlag;
use feature_flag::MockFeatureFlagClient;
use itertools::Itertools;
use macros::{test_state, test_state_case};
use newtypes::KybState;
use newtypes::OnboardingStatus;
use newtypes::SignalSeverity;
use newtypes::VendorAPI;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowState;
use newtypes::{DecisionStatus, FootprintReasonCode};
use std::sync::Arc;

async fn setup(
    state: &State,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (DbWorkflow, Tenant, ObConfiguration, Onboarding) {
    let is_live = fixture_result.is_none();
    let (t, ob, _v, _sv, obc, sbv) = test_helpers::create_kyb_user_and_onboarding(
        &state.db_pool,
        &state.enclave_client,
        None,
        is_live,
        fixture_result,
    )
    .await;

    let sb_svid = sbv.id.clone();
    let sb_vid = sbv.vault_id.clone();
    let wf = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let (ob, _, _, _) = Onboarding::get(conn, (&sb_svid, &sb_vid)).unwrap();
            Ok(DbWorkflow::get(conn, &ob.workflow_id.unwrap()).unwrap())
        })
        .await
        .unwrap();

    (wf, t, obc, ob)
}

async fn kyc_bo(state: &mut State, person_ob: &Onboarding) {
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
    );

    let obid = person_ob.id.clone();
    let wfid = person_ob.workflow_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            crate::decision::risk::save_final_decision(
                conn,
                obid,
                vec![],
                &Decision {
                    decision_status: DecisionStatus::Pass,
                    should_commit: false,
                    create_manual_review: false,
                    vendor_api: VendorAPI::MiddeskBusinessUpdateWebhook,
                },
                true,
                wfid,
                vec![],
            )
        })
        .await
        .unwrap();
    crate::task::execute_webhook_tasks(state.clone());
}

#[test_state]
async fn authorize(state: &mut State) {
    let (wf, _, _, _) = setup(state, None).await;

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::DataCollection(_))
    ));

    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::AwaitingBoKyc(_))
    ));
}

#[test_state_case(WorkflowFixtureResult::Pass)]
#[test_state_case(WorkflowFixtureResult::Fail)]
#[tokio::test(flavor = "multi_thread")]
async fn sandbox(state: &mut State, fixture_result: WorkflowFixtureResult) {
    // SETUP
    let (wf, tenant, _, person_ob) = setup(state, Some(fixture_result)).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client
        .expect_flag()
        .times(2)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(false);
    state.set_ff_client(Arc::new(mock_ff_client));

    // BoKycCompleted
    kyc_bo(state, &person_ob).await;
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending))],
        vec![],
    );

    let (ww, _) = ww
        .action(state, WorkflowActions::BoKycCompleted(BoKycCompleted {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::VendorCalls(_))
    ));

    let (ob, wf, _, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::VendorCalls), wf.state);
    assert_eq!(OnboardingStatus::Pending, ob.status);
    assert!(ob.idv_reqs_initiated_at.is_none());
    assert!(ob.decision_made_at.is_none());

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();
    // In sandbox, we should go straight to Decisioning (ie skip AwaitingAsyncVendors state becuase we are mocking middesk)
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::Decisioning(_))
    ));

    let (ob, wf, _, _, _, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::Decisioning), wf.state);
    assert!(ob.idv_reqs_initiated_at.is_some());
    assert!(ob.decision_made_at.is_none());

    // Appropriate KYB passing risk signals are produced and not hidden
    let expected_severity = match fixture_result {
        WorkflowFixtureResult::Fail => SignalSeverity::High,
        WorkflowFixtureResult::Pass => SignalSeverity::Info,
        WorkflowFixtureResult::ManualReview => todo!(),
        WorkflowFixtureResult::StepUp => todo!(),
        WorkflowFixtureResult::DocumentDecision => panic!("unsupported fixture passed for kyb"),
    };
    assert!(rs.iter().all(|rs| rs.reason_code.severity() == expected_severity
        && !rs.reason_code.scope().unwrap().is_for_person()
        && rs.vendor_api == VendorAPI::MiddeskBusinessUpdateWebhook
        && !rs.hidden));

    // MakeDecision
    let expected_status = match fixture_result {
        WorkflowFixtureResult::Fail => OnboardingStatus::Fail,
        WorkflowFixtureResult::Pass => OnboardingStatus::Pass,
        WorkflowFixtureResult::ManualReview => todo!(),
        WorkflowFixtureResult::StepUp => todo!(),
        WorkflowFixtureResult::DocumentDecision => panic!("unsupported fixture passed for kyb"),
    };
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(expected_status))],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_status),
            ExpectedRequiresManualReview(false),
        )],
    );

    let (_ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (ob, wf, _, mr, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::Complete), wf.state);
    assert!(ob.decision_made_at.is_some());
    assert!(mr.is_none());
    assert_eq!(expected_status, ob.status);
}

#[test_state_case(TerminalDecisionStatus::Pass)]
#[test_state_case(TerminalDecisionStatus::Fail)]
#[tokio::test(flavor = "multi_thread")]
async fn live(state: &mut State, terminal_status: TerminalDecisionStatus) {
    // SETUP
    let (wf, tenant, obc, person_ob) = setup(state, None).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    let (_, wf, _, _, _, _, fingerprints) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::AwaitingBoKyc), wf.state);
    assert!(!fingerprints.is_empty());

    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client
        .expect_flag()
        .times(2)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(false);
    mock_ff_client
        .expect_flag()
        .withf(move |f| *f == BoolFlag::EnableMiddeskInNonProd(&obc.key))
        .return_once(move |_| true);

    state.set_ff_client(Arc::new(mock_ff_client));

    // BoKycCompleted
    kyc_bo(state, &person_ob).await;
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending))],
        vec![],
    );

    let (ww, _) = ww
        .action(state, WorkflowActions::BoKycCompleted(BoKycCompleted {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::VendorCalls(_))
    ));

    let (ob, wf, _, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::VendorCalls), wf.state);
    assert_eq!(OnboardingStatus::Pending, ob.status);
    assert!(ob.idv_reqs_initiated_at.is_none());
    assert!(ob.decision_made_at.is_none());

    // MakeVendorCalls
    let business_id = "business123yo".to_owned();
    mock_middesk(state, &business_id);

    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();
    // In sandbox, we should go straight to Decisioning (ie skip AwaitingAsyncVendors state becuase we are mocking middesk)
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::AwaitingAsyncVendors(_))
    ));

    let (ob, wf, _, _, _, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::AwaitingAsyncVendors), wf.state);
    assert!(ob.idv_reqs_initiated_at.is_some());
    assert!(ob.decision_made_at.is_none());
    assert!(rs.is_empty());

    // Simulate Middesk webhook incoming. Middesk state machine should complete and then call the KYB workflow
    let expected_status = terminal_status.into();
    let expected_manual_review = matches!(terminal_status, TerminalDecisionStatus::Fail);
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(expected_status))],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_status),
            ExpectedRequiresManualReview(expected_manual_review),
        )],
    );

    crate::decision::vendor::middesk::handle_middesk_webhook(
        state,
        idv::tests::fixtures::middesk::business_update_webhook(
            &business_id,
            matches!(terminal_status, TerminalDecisionStatus::Fail),
        ),
    )
    .await
    .unwrap();

    let (ob, wf, _, mr, _, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::Complete), wf.state);
    assert!(ob.decision_made_at.is_some());

    let mut expected_rs = vec![
        (
            VendorAPI::MiddeskBusinessUpdateWebhook,
            FootprintReasonCode::BusinessNameMatch,
        ),
        (
            VendorAPI::MiddeskBusinessUpdateWebhook,
            FootprintReasonCode::BusinessAddressMatch,
        ),
        (
            VendorAPI::MiddeskBusinessUpdateWebhook,
            FootprintReasonCode::TinMatch,
        ),
    ];
    match terminal_status {
        TerminalDecisionStatus::Pass => {
            assert!(mr.is_none());
            assert_eq!(OnboardingStatus::Pass, ob.status);
        }
        TerminalDecisionStatus::Fail => {
            assert!(mr.is_some());
            assert_eq!(OnboardingStatus::Fail, ob.status);
            expected_rs.push((
                VendorAPI::MiddeskBusinessUpdateWebhook,
                FootprintReasonCode::BusinessNameWatchlistHit,
            ));
        }
    }

    assert_eq!(
        expected_rs,
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec()
    );
}
