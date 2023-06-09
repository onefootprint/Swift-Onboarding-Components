use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_twilio, mock_webhook, query_data, setup_data, ExpectedRequiresManualReview,
    ExpectedStatus, UserKind, WithQualifier,
};
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::decision::state::{MakeDecision, Workflow};
use crate::decision::tests::test_helpers;
use crate::utils::mock_enclave::MockEnclave;
use crate::{decision::state::kyc, State};
use chrono::Utc;
use db::models::onboarding::Onboarding;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VerificationRequest;
use db::models::workflow::NewWorkflow;
use db::models::workflow::Workflow as DbWorkflow;
use db::models::workflow_event::WorkflowEvent;
use db::tests::test_db_pool::TestDbPool;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use feature_flag::MockFeatureFlagClient;
use itertools::Itertools;
use macros::test_state;
use macros::{test_db_pool, test_state_case};
use newtypes::WorkflowConfig;
use newtypes::{KycConfig, OnboardingStatus};
use newtypes::{KycState, WorkflowId, WorkflowState};
use std::sync::Arc;
use webhooks::events::WebhookEvent;
use webhooks::MockWebhookClient;

async fn create_wf(state: &State, s: newtypes::WorkflowState) -> DbWorkflow {
    let (_, _, _, sv, _, _) = test_helpers::create_user_and_onboarding(
        &state.db_pool,
        &state.enclave_client,
        None,
        None,
        true,
        None,
    )
    .await;

    state
        .db_pool
        .db_query(move |conn| {
            DbWorkflow::insert(
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

async fn get_wf(state: &State, wfid: WorkflowId) -> (DbWorkflow, Vec<WorkflowEvent>) {
    state
        .db_pool
        .db_query(move |conn| {
            let wf = DbWorkflow::get(conn, &wfid).unwrap();
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
        WorkflowKind::Kyc(kyc::KycState::DataCollection(_))
    ));

    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyc(kyc::KycState::VendorCalls(_))
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

#[test_state_case(UserKind::Demo)]
#[test_state_case(UserKind::Sandbox)]
#[test_state_case(UserKind::Live)]
#[tokio::test]
async fn pass(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(
        state,
        user_kind,
        None,
        matches!(user_kind, UserKind::Sandbox).then(|| "pass".to_owned()),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    mock_ff_client
        .expect_flag()
        .times(2)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(state, WithQualifier(None));
            mock_twilio(state);
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    /// TESTS
    ///
    /// Authorize
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, fps) = query_data(state, &svid, &wfid).await;
    assert!(ob.authorized_at.is_some());
    assert!(ob.idv_reqs_initiated_at.is_some());
    assert!(ob.decision_made_at.is_none());
    assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state);
    assert!(!fps.is_empty()); //fingerprints were written

    /// MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert!(ob.decision_made_at.is_none());
    assert_eq!(WorkflowState::Kyc(KycState::Decisioning), wf.state);

    // Expect Webhook
    mock_webhook(
        state,
        ExpectedStatus(OnboardingStatus::Pass),
        ExpectedRequiresManualReview(false),
    );

    /// MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    assert_eq!(OnboardingStatus::Pass, ob.status);
    assert!(mr.is_none());
    assert!(!rs.is_empty()); // TODO: assert specific risk signals
}
