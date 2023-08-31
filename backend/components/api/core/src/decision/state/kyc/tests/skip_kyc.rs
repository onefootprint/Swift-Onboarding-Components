use crate::decision::state::test_utils::{setup_data, UserKind};
use crate::State;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use macros::test_state_case;
use newtypes::WorkflowFixtureResult;

#[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox(WorkflowFixtureResult::Pass))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn collet_doc_skip_kyc(state: &mut State, user_kind: UserKind) {
    // DATA SETUP
    let (_wf, _tenant, _obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            skip_kyc: true,
            ..Default::default()
        },
        user_kind.fixture_result(),
    )
    .await;
    // TODO: run Workflow, assert no KYC calls are made, no KYC risk signals are produced, decision is still made, and completes no error
}
