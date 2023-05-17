use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowStates;
use crate::decision::state::WorkflowWrapper;
use crate::decision::tests::test_helpers;
use crate::utils::mock_enclave::StateWithMockEnclave;
use crate::{decision::state::kyc, State};
use db::models::workflow::Workflow;
use db::models::workflow_event::WorkflowEvent;
use db::tests::test_db_pool::TestDbPool;
use itertools::Itertools;
use macros::test_db_pool;
use newtypes::{KycState, WorkflowId, WorkflowState};

async fn create_wf(state: &State, s: WorkflowState) -> Workflow {
    let (_, _, _, sv, _) =
        test_helpers::create_user_and_onboarding(&state.db_pool, &state.enclave_client, None).await;

    state
        .db_pool
        .db_query(|conn| Workflow::create(conn, sv.id, (&s).into(), s).unwrap())
        .await
        .unwrap()
}

async fn get_wf(state: &State, wfid: WorkflowId) -> (Workflow, Vec<WorkflowEvent>) {
    state
        .db_pool
        .db_query(move |conn| {
            let wf = Workflow::get(conn, &wfid).unwrap();
            let wfe = WorkflowEvent::list_for_workflow(conn, &wfid).unwrap();
            (wf, wfe)
        })
        .await
        .unwrap()
}

#[test_db_pool]
async fn valid_action(db_pool: TestDbPool) {
    // TODO: make a proper TestState / macro, lots of tests need it
    let state = &mut StateWithMockEnclave::init().await.state;
    state.set_db_pool((*db_pool).clone());

    let wf = create_wf(state, KycState::DataCollection.into()).await;
    let wfid = wf.id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    assert!(matches!(
        ww.state,
        WorkflowStates::Kyc(kyc::States::DataCollection(_))
    ));

    let ww = ww
        .action(state, WorkflowActions::from(kyc::Actions::from(kyc::Authorize)))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowStates::Kyc(kyc::States::VendorCalls(_))
    ));

    let (wf, wfe) = get_wf(state, wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state);
    assert_eq!(1, wfe.len());
    let wfe = wfe.first().unwrap();
    assert!(wfe.from_state == WorkflowState::Kyc(KycState::DataCollection));
    assert!(wfe.to_state == WorkflowState::Kyc(KycState::VendorCalls));
}

#[test_db_pool]
async fn invalid_action(db_pool: TestDbPool) {
    let state = &mut StateWithMockEnclave::init().await.state;
    state.set_db_pool((*db_pool).clone());

    let wf = create_wf(state, KycState::DataCollection.into()).await;
    let wfid = wf.id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let _e = ww
        .action(
            state,
            WorkflowActions::from(kyc::Actions::from(kyc::MakeVendorCalls)),
        )
        .await
        .err()
        .unwrap();

    let (wf, wfe) = get_wf(state, wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::DataCollection), wf.state);
    assert_eq!(0, wfe.len());
}

#[test_db_pool]
async fn run(db_pool: TestDbPool) {
    let state = &mut StateWithMockEnclave::init().await.state;
    state.set_db_pool((*db_pool).clone());

    let wf = create_wf(state, KycState::DataCollection.into()).await;
    let wfid = wf.id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let ww = ww
        .run(state, WorkflowActions::from(kyc::Actions::from(kyc::Authorize)))
        .await
        .unwrap();

    assert!(matches!(ww.state, WorkflowStates::Kyc(kyc::States::Complete(_))));

    let (wf, wfe) = get_wf(state, wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    assert_eq!(3, wfe.len());
    assert_eq!(
        vec![
            (KycState::DataCollection.into(), KycState::VendorCalls.into()),
            (KycState::VendorCalls.into(), KycState::Decisioning.into()),
            (KycState::Decisioning.into(), KycState::Complete.into())
        ],
        wfe.into_iter().map(|e| (e.from_state, e.to_state)).collect_vec()
    );
}
