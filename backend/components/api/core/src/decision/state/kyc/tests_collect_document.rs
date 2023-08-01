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
use db::models::onboarding::Onboarding;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::RiskSignal;
use db::models::workflow::Workflow;
use db::test_helpers::assert_have_same_elements;
use feature_flag::BoolFlag;
use feature_flag::MockFeatureFlagClient;
use itertools::Itertools;
use macros::test_state_case;
use newtypes::OnboardingStatus;
use newtypes::{
    DbActor, DecisionStatus, DocumentConfig, FootprintReasonCode, RiskSignalGroupKind, TenantId, VendorAPI,
};
use newtypes::{KycState, WorkflowState};
use std::sync::Arc;

#[test_state_case(UserKind::Live, Failure)]
#[test_state_case(UserKind::Live, DocUploadFailed)]
#[tokio::test]
async fn document_fails(state: &mut State, user_kind: UserKind, doc_outcome: DocumentOutcome) {
    // DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(state, user_kind, None, user_kind.fixture_result()).await;
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

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            // TODO: sandbox won't work yet
            // https://linear.app/footprint/issue/FP-5157/sandbox-fixtures
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
    let (ob, wf, _, _, _, _, fps) = query_data(state, &svid, &wfid).await;
    assert!(ob.authorized_at.is_some());
    assert!(ob.idv_reqs_initiated_at.is_some());
    assert!(ob.decision_made_at.is_none());
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
    assert!(rs_kyc.iter().all(|r| r.hidden));
    let mut risk_signals_for_doc = vec![];

    if !doc_upload_failed {
        let rs_doc = query_risk_signals(state, &svid, RiskSignalGroupKind::Doc).await;
        assert!(!rs_doc.is_empty());
        assert!(rs_doc.iter().all(|r| !r.hidden));
        risk_signals_for_doc = rs_doc;
    }

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

    let (ob, wf, _, mr, obd, rs, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Fail);
    assert!(obd.seqno.is_some());
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Fail, ob.status);
    assert!(ob.decision_made_at.is_some());
    if doc_upload_failed {
        assert!(mr.is_some());
    } else {
        assert!(mr.is_none());
    }

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {}
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    Some((VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches)),
                    Some((VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches)),
                    Some((VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches)),
                    Some((VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches)),
                    // TODO: assert doc upload failed RS when we have it
                    (!doc_upload_failed).then_some((
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentNotVerified,
                    )),
                ]
                .into_iter()
                .flatten()
                .collect(),
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );

            // redo document
            redo_document_and_pass(state, user_kind, &ob, &obd, &tenant.id, risk_signals_for_doc).await
        }
    }
}

#[allow(clippy::too_many_arguments)]
async fn redo_document_and_pass(
    state: &mut State,
    user_kind: UserKind,
    prior_ob: &Onboarding,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
    previous_risk_signals: Vec<RiskSignal>,
) {
    // Trigger Redo workflow
    let sv_id = prior_ob.scoped_vault_id.clone();
    let wf = state
        .db_pool
        .db_query(move |conn| Workflow::create(conn, &sv_id, DocumentConfig {}.into(), None).unwrap())
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

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
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
        vec![],
    );

    let _: WorkflowWrapper = ww
        .run(state, WorkflowActions::DocCollected(DocCollected {}))
        .await
        .unwrap();

    let (ob, wf, _, _, obd, rs, _) = query_data(state, &svid2, &wfid).await;
    assert_eq!(
        WorkflowState::Document(newtypes::DocumentState::Complete),
        wf.state
    );
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert!(obd.status == DecisionStatus::Pass);
    // TODO: this logic will change, see https://linear.app/footprint/issue/FP-5195/fix-committing-data
    assert!(obd.seqno.is_some());
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Pass, ob.status);
    // redo flow hasn't modified timestamps on ob
    assert!(prior_ob.authorized_at == ob.authorized_at);
    assert!(prior_ob.idv_reqs_initiated_at == ob.idv_reqs_initiated_at);
    assert!(prior_ob.decision_made_at == ob.decision_made_at);

    // check RSG is different
    let rs_passing_doc = query_risk_signals(state, &svid2, RiskSignalGroupKind::Doc).await;
    let previous_rs_ids: Vec<newtypes::RiskSignalId> =
        previous_risk_signals.into_iter().map(|r| r.id).collect();
    assert!(!rs_passing_doc.is_empty());
    // check we have new risk signals, and none of them are hidden
    rs_passing_doc
        .into_iter()
        .for_each(|r| assert!(!previous_rs_ids.contains(&r.id) && !r.hidden));

    assert_have_same_elements(
        vec![
            (VendorAPI::IdologyExpectID, FootprintReasonCode::AddressMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::SsnMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::NameMatches),
            (VendorAPI::IdologyExpectID, FootprintReasonCode::DobMatches),
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
