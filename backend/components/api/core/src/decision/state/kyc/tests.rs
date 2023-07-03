use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_twilio, mock_webhooks, query_data, setup_data, ExpectedRequiresManualReview,
    ExpectedStatus, OnboardingCompleted, OnboardingStatusChanged, UserKind, WithQualifier,
};
use crate::decision::state::MakeDecision;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::decision::tests::test_helpers;
use crate::utils::mock_enclave::MockEnclave;
use crate::{decision::state::kyc, State};
use chrono::Utc;
use db::models::onboarding::Onboarding;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::scoped_vault::ScopedVault;
use db::models::verification_request::VerificationRequest;
use db::models::workflow::NewWorkflow;
use db::models::workflow::Workflow;
use db::models::workflow::Workflow as DbWorkflow;
use db::models::workflow_event::WorkflowEvent;
use db::test_helpers::assert_have_same_elements;
use db::tests::test_db_pool::TestDbPool;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use feature_flag::MockFeatureFlagClient;
use itertools::Itertools;
use macros::test_state;
use macros::{test_db_pool, test_state_case};
use newtypes::{
    DbActor, DecisionStatus, FootprintReasonCode, ObConfigurationKey, SignalSeverity, TenantId, Vendor,
    VendorAPI, WorkflowConfig,
};
use newtypes::{KycConfig, OnboardingStatus};
use newtypes::{KycState, WorkflowId, WorkflowState};
use std::sync::Arc;
use std::time::Duration;
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
#[test_state_case(UserKind::Sandbox("pass"))]
#[test_state_case(UserKind::Live)]
#[tokio::test]
async fn pass(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(state, user_kind, None, user_kind.phone_suffix()).await;
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
        UserKind::Demo | UserKind::Sandbox(_) => {}
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
    // Expect Webhook
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pending))],
        vec![],
    );

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

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
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

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert!(rs.iter().all(|rs| rs.vendor_api == VendorAPI::IdologyExpectID));
            assert!(rs
                .iter()
                .all(|rs| rs.reason_code.severity() == SignalSeverity::Info));
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    };
}

#[test_state_case(UserKind::Sandbox("manualreview"))]
#[test_state_case(UserKind::Sandbox("fail"))]
#[test_state_case(UserKind::Live)]
#[tokio::test]
async fn fail(state: &mut State, user_kind: UserKind) {
    /// DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(state, user_kind, None, user_kind.phone_suffix()).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .times(2)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            mock_idology(
                state,
                WithQualifier(Some("resultcode.ssn.does.not.match".to_owned())),
            );
            mock_twilio(state);
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    /// TESTS
    ///
    /// Authorize
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

    // Expect Webhook
    let expect_review = matches!(user_kind, UserKind::Sandbox("manualreview")); //#fail currently indicates hard failing without raising review
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Fail))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(expect_review),
        )],
    );

    /// MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Fail);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Fail, ob.status);
    assert!(ob.decision_made_at.is_some());
    if expect_review {
        assert!(mr.is_some());
    } else {
        assert!(mr.is_none());
    }

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            let severity = if expect_review {
                SignalSeverity::Medium
            } else {
                SignalSeverity::High
            };
            assert!(rs.iter().all(|rs| rs.vendor_api == VendorAPI::IdologyExpectID));
            assert!(rs.iter().all(|rs| rs.reason_code.severity() == severity));
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnDoesNotMatch),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
                    (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    }
    // Test Redo as well
    match user_kind {
        // TODO: we don't really currently provide a way to specicfy fixtures for a Redo flow
        UserKind::Demo | UserKind::Sandbox(_) => {}
        UserKind::Live => {
            redo_and_pass(state, user_kind, &ob, &obd, &tenant.id, &obc.key).await;
        }
    }
}

async fn redo_and_pass(
    state: &mut State,
    user_kind: UserKind,
    prior_ob: &Onboarding,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
    ob_config_key: &ObConfigurationKey,
) {
    // Trigger Redo workflow
    let sv_id = prior_ob.scoped_vault_id.clone();
    let wf = state
        .db_pool
        .db_query(move |conn| Workflow::create(conn, &sv_id, KycConfig { is_redo: true }.into()).unwrap())
        .await
        .unwrap();

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    /// MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant_id.clone();
    mock_ff_client
        .expect_flag()
        .times(2)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = ob_config_key.clone();
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
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![],
    );

    let ww: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (ob, wf, wfe, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert!(obd.status == DecisionStatus::Pass);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Pass, ob.status);
    // redo flow hasn't modified timestamps on ob
    assert!(prior_ob.authorized_at == ob.authorized_at);
    assert!(prior_ob.idv_reqs_initiated_at == ob.idv_reqs_initiated_at);
    assert!(prior_ob.decision_made_at == ob.decision_made_at);

    assert_have_same_elements(
        vec![
            (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
        ],
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );
}
