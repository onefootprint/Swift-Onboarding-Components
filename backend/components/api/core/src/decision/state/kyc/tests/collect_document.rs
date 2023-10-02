use crate::decision::state::actions::{Authorize, MakeVendorCalls};
use crate::decision::state::test_utils::{
    mock_idology, mock_incode_doc_collection, mock_webhooks, query_data, query_risk_signals, setup_data,
    DocumentOutcome::{self, *},
    ExpectedRequiresManualReview, ExpectedStatus, OnboardingCompleted, OnboardingStatusChanged, UserKind,
    WithQualifier,
};
use crate::decision::state::WorkflowActions;

use crate::decision::state::WorkflowWrapper;
use crate::decision::state::{DocCollected, MakeDecision};

use crate::State;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::RiskSignal;
use db::models::workflow::{NewWorkflowArgs, Workflow};
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use feature_flag::BoolFlag;
use feature_flag::MockFeatureFlagClient;
use itertools::Itertools;
use macros::test_state_case;
use newtypes::{
    DbActor, DecisionStatus, DocumentConfig, FootprintReasonCode, RiskSignalGroupKind, TenantId, VendorAPI,
};
use newtypes::{KycState, WorkflowState};
use newtypes::{OnboardingStatus, WorkflowFixtureResult};
use std::sync::Arc;

#[test_state_case(UserKind::Live, Failure)]
#[test_state_case(UserKind::Live, DocUploadFailed)]
#[test_state_case(UserKind::Sandbox(newtypes::WorkflowFixtureResult::DocumentDecision), Failure)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn document_fails(state: &mut State, user_kind: UserKind, doc_outcome: DocumentOutcome) {
    // DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            ..Default::default()
        },
        user_kind.fixture_result(),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let svid2 = wf.scoped_vault_id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let doc_upload_failed = doc_outcome == DocUploadFailed;

    // MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .times(3)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    let mut expect_committed = true;

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            // TODO: sandbox tests
            // https://linear.app/footprint/issue/FP-5157/sandbox-fixtures
            mock_incode_doc_collection(state, svid2, doc_outcome, wfid.clone(), true).await;
            // we don't even look at KYC results for this
            expect_committed = false;
        }
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client
                .expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| true);

            // KYC Passes
            mock_idology(state, WithQualifier(None));

            mock_incode_doc_collection(state, svid2, doc_outcome, wfid.clone(), true).await;
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));

    // TESTS
    //
    // Authorize
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
    let (wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state);
    assert!(!fps.is_empty()); //fingerprints were written

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let rs_kyc = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs_kyc.is_empty());
    // hidden at this time, until decision
    assert!(rs_kyc.iter().all(|r| !r.hidden));
    let risk_signals_for_doc = query_risk_signals(state, &svid, RiskSignalGroupKind::Doc).await;

    assert!(!risk_signals_for_doc.is_empty());
    assert!(risk_signals_for_doc.iter().all(|r| !r.hidden));

    // Expect Webhook
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Fail))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(doc_upload_failed),
        )],
    );

    // MakeDecision
    let (_, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Fail);
    if expect_committed {
        assert!(obd.seqno.is_some());
    } else {
        assert!(obd.seqno.is_none());
    }

    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
    if doc_upload_failed {
        assert!(mr.is_some());
    } else {
        assert!(mr.is_none());
    }

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            // redo document
            redo_document_and_pass(state, user_kind, &wf, &obd, &tenant.id, risk_signals_for_doc).await
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches)),
                    // TODO: assert doc upload failed RS when we have it
                    (!doc_upload_failed).then_some((
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentNotVerified,
                    )),
                    (doc_upload_failed.then_some((
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentUploadFailed,
                    ))),
                ]
                .into_iter()
                .flatten()
                .collect(),
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );

            // redo document
            redo_document_and_pass(state, user_kind, &wf, &obd, &tenant.id, risk_signals_for_doc).await
        }
    }
}

#[allow(clippy::too_many_arguments)]
async fn redo_document_and_pass(
    state: &mut State,
    user_kind: UserKind,
    prior_wf: &Workflow,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
    previous_risk_signals: Vec<RiskSignal>,
) {
    // Trigger Redo workflow
    let sv_id = prior_wf.scoped_vault_id.clone();
    let fixture_result = prior_wf.fixture_result;
    let obc_id = prior_wf.ob_configuration_id.clone();
    let wf = state
        .db_pool
        .db_transaction(move |conn| {
            let args = NewWorkflowArgs {
                scoped_vault_id: sv_id.clone(),
                config: DocumentConfig {}.into(),
                fixture_result,
                ob_configuration_id: obc_id,
                insight_event_id: None,
                authorized: false,
            };
            Workflow::create(conn, args)
        })
        .await
        .unwrap();

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let svid2 = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf.clone()).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFeatureFlagClient::new();

    let tenant_id = tenant_id.clone();
    mock_ff_client
        .expect_flag()
        .times(1)
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .return_const(matches!(user_kind, UserKind::Demo));

    let mut expect_committed = true;

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            mock_incode_doc_collection(state, svid, Success, wfid.clone(), true).await;
            expect_committed = false;
        }
        // Mock vendor calls for Live users
        UserKind::Live => {
            // we aren't re-running KYC, just doc
            mock_incode_doc_collection(state, svid, Success, wfid.clone(), true).await
        }
    };
    state.set_ff_client(Arc::new(mock_ff_client));
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(ExpectedStatus(OnboardingStatus::Pass))],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
    );

    let _: WorkflowWrapper = ww
        .run(state, WorkflowActions::DocCollected(DocCollected {}))
        .await
        .unwrap();

    let (wf, _, _, obd, rs, _) = query_data(state, &svid2, &wfid).await;
    assert_eq!(
        WorkflowState::Document(newtypes::DocumentState::Complete),
        wf.state
    );
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert!(obd.status == DecisionStatus::Pass);
    if expect_committed {
        assert!(obd.seqno.is_some())
    } else {
        assert!(obd.seqno.is_none())
    };
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());

    // check RSG is different
    let rs_passing_doc = query_risk_signals(state, &svid2, RiskSignalGroupKind::Doc).await;
    let previous_rs_ids: Vec<newtypes::RiskSignalId> =
        previous_risk_signals.into_iter().map(|r| r.id).collect();
    assert!(!rs_passing_doc.is_empty());
    // check we have new risk signals, and none of them are hidden
    rs_passing_doc
        .into_iter()
        .for_each(|r| assert!(!previous_rs_ids.contains(&r.id) && !r.hidden));
    match user_kind {
        UserKind::Sandbox(WorkflowFixtureResult::DocumentDecision) => {
            // In this case, we run real rules to get a decision. In this case, we do not generate synthetic KYC signals.
            // I think this is fine since the purpose of doing sandbox real document is just to see the doc outcome, not to get synthetic KYC risk signals
            assert!(rs
                .into_iter()
                .map(|rs| (rs.vendor_api, rs.reason_code))
                .any(|vendor_rc_tuple| vendor_rc_tuple
                    == (
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentVerified,
                    )));
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches),
                    (VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches),
                    (
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentVerified,
                    ),
                ],
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
        _ => unimplemented!(),
    }
}
