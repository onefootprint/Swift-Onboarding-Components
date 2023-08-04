use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::kyb;
use crate::decision::state::Authorize;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::{decision::tests::test_helpers, State};
use db::models::workflow::Workflow as DbWorkflow;
use db::tests::test_db_pool::TestDbPool;
use macros::test_state;
use newtypes::KybConfig;
use newtypes::WorkflowFixtureResult;

async fn setup(state: &State) -> DbWorkflow {
    let (_t, _ob, _v, _sv, _obc, sbv) = test_helpers::create_kyb_user_and_onboarding(
        &state.db_pool,
        &state.enclave_client,
        None,
        false,
        Some(WorkflowFixtureResult::Pass),
    )
    .await;

    let svid = sbv.id.clone();
    state
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
        .unwrap()
}

#[test_state]
async fn authorize(state: &mut State) {
    let wf = setup(state).await;

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
