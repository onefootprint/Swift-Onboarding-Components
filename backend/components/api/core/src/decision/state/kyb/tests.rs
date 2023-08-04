use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::kyb;
use crate::decision::state::test_utils::query_data;
use crate::decision::state::test_utils::{mock_webhooks, ExpectedStatus, OnboardingStatusChanged};
use crate::decision::state::Authorize;
use crate::decision::state::BoKycCompleted;
use crate::decision::state::MakeVendorCalls;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::{decision::tests::test_helpers, State};
use db::models::tenant::Tenant;
use db::models::workflow::Workflow as DbWorkflow;
use db::tests::test_db_pool::TestDbPool;
use feature_flag::BoolFlag;
use feature_flag::MockFeatureFlagClient;
use macros::test_state;
use newtypes::KybState;
use newtypes::OnboardingStatus;
use newtypes::SignalSeverity;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowState;
use newtypes::{KybConfig, VendorAPI};
use std::sync::Arc;

async fn setup(state: &State) -> (DbWorkflow, Tenant) {
    let (t, _ob, _v, _sv, _obc, sbv) = test_helpers::create_kyb_user_and_onboarding(
        &state.db_pool,
        &state.enclave_client,
        None,
        false,
        Some(WorkflowFixtureResult::Pass),
    )
    .await;

    let svid = sbv.id.clone();
    let wf = state
        .db_pool
        .db_query(move |conn| {
            DbWorkflow::create(
                conn,
                &svid,
                KybConfig {}.into(),
                Some(WorkflowFixtureResult::Pass),
            )
            .unwrap()
        })
        .await
        .unwrap();
    (wf, t)
}

#[test_state]
async fn authorize(state: &mut State) {
    let (wf, _tenant) = setup(state).await;

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

#[test_state]
async fn sandbox_makevendorcalls(state: &mut State) {
    // SETUP
    let (wf, tenant) = setup(state).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::BoKycCompleted(BoKycCompleted {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::VendorCalls(_))
    ));

    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client
        .expect_flag()
        .times(1)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(false);
    state.set_ff_client(Arc::new(mock_ff_client));

    // TEST
    // TODO: should probably set status=pending when transitioning from AwaitingBoKyc to VendorCalls
    // for now, when we write test fixtures on MakeVendorCalls, we are setting status=pending
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending))],
        vec![],
    );

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
    assert!(rs
        .iter()
        .all(|rs| rs.reason_code.severity() == SignalSeverity::Info
            && !rs.reason_code.scope().unwrap().is_for_person()
            && rs.vendor_api == VendorAPI::MiddeskBusinessUpdateWebhook
            && !rs.hidden));
}
