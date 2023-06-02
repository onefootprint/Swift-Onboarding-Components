use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowState;
use crate::decision::state::WorkflowWrapper;
use crate::decision::state::WorkflowWrapperState;
use crate::decision::tests::test_helpers;
use crate::utils::mock_enclave::MockEnclave;
use crate::{decision::state::kyc, State};
use chrono::Utc;
use db::models::onboarding::Onboarding;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VerificationRequest;
use db::models::workflow::NewWorkflow;
use db::models::workflow::Workflow;
use db::models::workflow_event::WorkflowEvent;
use db::tests::test_db_pool::TestDbPool;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use feature_flag::MockFeatureFlagClient;
use itertools::Itertools;
use macros::test_db_pool;
use macros::test_state;
use newtypes::KycConfig;
use newtypes::WorkflowConfig;
use newtypes::{KycState, WorkflowId};
use std::sync::Arc;

async fn create_wf(state: &State, s: newtypes::WorkflowState) -> Workflow {
    let (_, _, _, sv, _, _) =
        test_helpers::create_user_and_onboarding(&state.db_pool, &state.enclave_client, None, true, None)
            .await;

    state
        .db_pool
        .db_query(|conn| {
            Workflow::create(
                conn,
                NewWorkflow {
                    created_at: Utc::now(),
                    scoped_vault_id: sv.id,
                    kind: (&s).into(),
                    state: s,
                    config: WorkflowConfig::Kyc(KycConfig { is_redo: false }),
                },
            )
            .unwrap()
        })
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

#[test_state]
async fn valid_action(state: &mut State) {
    let wf = create_wf(state, KycState::DataCollection.into()).await;
    let wfid = wf.id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    assert!(matches!(
        ww.state,
        WorkflowWrapperState::Kyc(kyc::States::DataCollection(_))
    ));

    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowWrapperState::Kyc(kyc::States::VendorCalls(_))
    ));

    let (wf, wfe) = get_wf(state, wfid).await;
    assert_eq!(newtypes::WorkflowState::Kyc(KycState::VendorCalls), wf.state);
    assert_eq!(1, wfe.len());
    let wfe = wfe.first().unwrap();
    assert!(wfe.from_state == newtypes::WorkflowState::Kyc(KycState::DataCollection));
    assert!(wfe.to_state == newtypes::WorkflowState::Kyc(KycState::VendorCalls));
}

#[test_state]
async fn invalid_action(state: &mut State) {
    let wf = create_wf(state, KycState::DataCollection.into()).await;
    let wfid = wf.id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let _e = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .err()
        .unwrap();

    let (wf, wfe) = get_wf(state, wfid).await;
    assert_eq!(newtypes::WorkflowState::Kyc(KycState::DataCollection), wf.state);
    assert_eq!(0, wfe.len());
}

// commenting out since CI still seemed to be running
// #[test_db_pool]
// #[ignore] // have to ignore for now until we have MockState and can mock the vendor calls properly
// async fn run(db_pool: TestDbPool) {
//     let state = &mut StateWithMockEnclave::init().await.state;
//     state.set_db_pool((*db_pool).clone());

//     let wf = create_wf(state, KycState::DataCollection.into()).await;
//     let wfid = wf.id.clone();

//     let ww = WorkflowWrapper::init(state, wf).await.unwrap();
//     let ww = ww
//         .run(state, WorkflowActions::from(kyc::Actions::from(kyc::Authorize)))
//         .await
//         .unwrap();

//     assert!(matches!(ww.state, WorkflowStates::Kyc(kyc::States::Complete(_))));

//     let (wf, wfe) = get_wf(state, wfid).await;
//     assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
//     assert_eq!(3, wfe.len());
//     assert_eq!(
//         vec![
//             (KycState::DataCollection.into(), KycState::VendorCalls.into()),
//             (KycState::VendorCalls.into(), KycState::Decisioning.into()),
//             (KycState::Decisioning.into(), KycState::Complete.into())
//         ],
//         wfe.into_iter().map(|e| (e.from_state, e.to_state)).collect_vec()
//     );
// }

#[test_state]
async fn authorize(state: &mut State) {
    let wf = create_wf(state, KycState::DataCollection.into()).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowWrapperState::Kyc(kyc::States::VendorCalls(_))
    ));

    let (wf, _) = get_wf(state, wfid).await;
    assert_eq!(newtypes::WorkflowState::Kyc(KycState::VendorCalls), wf.state);

    state
        .db_pool
        .db_query(move |conn| {
            let sv = ScopedVault::get(conn, &svid).unwrap();
            let (ob, _, _, _) = Onboarding::get(conn, (&sv.id, &sv.vault_id)).unwrap();

            assert!(ob.authorized_at.is_some());
            assert!(ob.idv_reqs_initiated_at.is_some());

            let vreqs =
                VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user(conn, sv.id)
                    .unwrap();
            assert!(!vreqs.is_empty());
            assert!(vreqs.into_iter().all(|(_vreq, vres)| vres.is_none()));
        })
        .await
        .unwrap();
}
