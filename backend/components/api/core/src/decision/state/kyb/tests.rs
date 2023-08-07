use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::test_utils::query_data;
use crate::decision::state::test_utils::{
    mock_webhooks, ExpectedRequiresManualReview, ExpectedStatus, OnboardingCompleted, OnboardingStatusChanged,
};
use crate::decision::state::Authorize;
use crate::decision::state::BoKycCompleted;
use crate::decision::state::MakeVendorCalls;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::decision::state::{kyb, MakeDecision};
use crate::{decision::tests::test_helpers, State};
use db::models::onboarding::Onboarding;
use db::models::tenant::Tenant;
use db::models::workflow::Workflow as DbWorkflow;
use db::tests::test_db_pool::TestDbPool;
use db::DbResult;
use feature_flag::BoolFlag;
use feature_flag::MockFeatureFlagClient;
use macros::{test_state, test_state_case};
use newtypes::KybState;
use newtypes::OnboardingStatus;
use newtypes::SignalSeverity;
use newtypes::VendorAPI;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowState;
use std::sync::Arc;

async fn setup(state: &State, fixture_result: Option<WorkflowFixtureResult>) -> (DbWorkflow, Tenant) {
    let is_live = fixture_result.is_none();
    let (t, _ob, _v, _sv, _obc, sbv) = test_helpers::create_kyb_user_and_onboarding(
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

    (wf, t)
}

#[test_state]
async fn authorize(state: &mut State) {
    let (wf, _tenant) = setup(state, None).await;

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
    let (wf, tenant) = setup(state, Some(fixture_result)).await;
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
