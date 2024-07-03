use crate::decision::state::actions::Authorize;
use crate::decision::state::actions::MakeVendorCalls;
use crate::decision::state::test_utils::mock_idology;
use crate::decision::state::test_utils::mock_incode_doc_collection;
use crate::decision::state::test_utils::mock_webhooks;
use crate::decision::state::test_utils::query_data;
use crate::decision::state::test_utils::query_portablized_seqno;
use crate::decision::state::test_utils::query_risk_signals;
use crate::decision::state::test_utils::setup_data;
use crate::decision::state::test_utils::DocumentOutcome::*;
use crate::decision::state::test_utils::DocumentOutcome::{
    self,
};
use crate::decision::state::test_utils::ExpectedRequiresManualReview;
use crate::decision::state::test_utils::ExpectedStatus;
use crate::decision::state::test_utils::OnboardingCompleted;
use crate::decision::state::test_utils::OnboardingStatusChanged;
use crate::decision::state::test_utils::UserKind;
use crate::decision::state::test_utils::WithQualifier;
use crate::decision::state::DocCollected;
use crate::decision::state::MakeDecision;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowWrapper;
use crate::FpResult;
use crate::State;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::RiskSignal;
use db::models::rule_instance::NewRule;
use db::models::rule_instance::RuleInstance;
use db::models::workflow::NewWorkflowArgs;
use db::models::workflow::Workflow;
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::MockFFClient;
use db::DbResult;
use feature_flag::BoolFlag;
use itertools::Itertools;
use macros::test_state_case;
use newtypes::BooleanOperator;
use newtypes::CollectedDataOption as CDO;
use newtypes::CountryRestriction;
use newtypes::DbActor;
use newtypes::DecisionStatus;
use newtypes::DocTypeRestriction;
use newtypes::DocumentCdoInfo;
use newtypes::DocumentConfig;
use newtypes::DocumentRequestConfig;
use newtypes::FootprintReasonCode;
use newtypes::KycState;
use newtypes::OnboardingStatus;
use newtypes::RiskSignalGroupKind;
use newtypes::RuleAction;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;
use newtypes::RuleInstanceKind;
use newtypes::Selfie;
use newtypes::TenantId;
use newtypes::VendorAPI;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowSource;
use newtypes::WorkflowState;

#[test_state_case(UserKind::Live, Failure)]
#[test_state_case(UserKind::Live, DocUploadFailed)]
#[test_state_case(UserKind::Sandbox(newtypes::WorkflowFixtureResult::UseRulesOutcome), Failure)]
#[test_state_case(UserKind::Live, PassWithManualReview)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn test_document_fails(state: &mut State, user_kind: UserKind, doc_outcome: DocumentOutcome) {
    // Also tests redo_document_and_pass at the end

    // DATA SETUP
    let (wf, tenant, obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            must_collect_data: vec![
                CDO::PhoneNumber,
                CDO::Ssn9,
                CDO::Document(DocumentCdoInfo(
                    DocTypeRestriction::None,
                    CountryRestriction::None,
                    Selfie::None,
                )),
            ],
            ..Default::default()
        },
        user_kind.fixture_result(),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let svid2 = wf.scoped_vault_id.clone();
    let obc_id2 = obc.id.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let doc_upload_failed = doc_outcome == DocUploadFailed;
    let doc_passed_with_review = doc_outcome == PassWithManualReview;
    let expected_status = if doc_passed_with_review {
        // This is not a default rule, but we're testing it here
        state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let obc = ObConfiguration::lock(conn, &obc_id2).unwrap();
                let rule = NewRule {
                    rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                        field: FootprintReasonCode::DocumentIsPermitOrProvisionalLicense,
                        op: BooleanOperator::Equals,
                        value: true,
                    }]),
                    action: RuleAction::PassWithManualReview,
                    name: None,
                    kind: RuleInstanceKind::Person,
                    is_shadow: false,
                };
                RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, vec![rule])
                    .unwrap()
                    .pop()
                    .unwrap();

                Ok(())
            })
            .await
            .unwrap();

        DecisionStatus::Pass
    } else {
        DecisionStatus::Fail
    };

    // MOCKING
    let mut mock_ff_client = MockFFClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            // TODO: sandbox tests
            // https://linear.app/footprint/issue/FP-5157/sandbox-fixtures
            mock_incode_doc_collection(
                state,
                svid2,
                doc_outcome.footprint_reason_codes(),
                wfid.clone(),
                true,
            )
            .await;
        }
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                    .return_const(true);
            });

            // KYC Passes
            mock_idology(state, WithQualifier(None));

            mock_incode_doc_collection(
                state,
                svid2,
                doc_outcome.footprint_reason_codes(),
                wfid.clone(),
                true,
            )
            .await;
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());

    // TESTS
    //
    // Authorize
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state);

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let rs_kyc = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs_kyc.is_empty());
    assert!(rs_kyc.iter().all(|r| !r.hidden));
    let risk_signals_for_doc = query_risk_signals(state, &svid, RiskSignalGroupKind::Doc).await;

    assert!(!risk_signals_for_doc.is_empty());
    assert!(risk_signals_for_doc.iter().all(|r| !r.hidden));

    // Expect Webhook
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(doc_outcome.expected_onboarding_decision()),
            ExpectedRequiresManualReview(doc_outcome.expect_manual_review()),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(doc_outcome.expected_onboarding_decision()),
            ExpectedRequiresManualReview(doc_outcome.expect_manual_review()),
        )],
    );

    // MakeDecision
    let (_, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();
    let (wf, _, mrs, obd, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert!(obd.status == expected_status);

    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(doc_outcome.expected_onboarding_decision(), wf.status);
    let expect_mr = doc_outcome.expect_manual_review();
    assert_eq!(expect_mr, !mrs.is_empty());

    let t_id = &tenant.id;
    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            // redo document
            collect_ad_hoc_document(state, user_kind, &wf, &obd, t_id, risk_signals_for_doc, expect_mr).await
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches)),
                    // TODO: assert doc upload failed RS when we have it
                    (!(doc_upload_failed || doc_passed_with_review)).then_some((
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentNotVerified,
                    )),
                    (doc_passed_with_review).then_some((
                        VendorAPI::IncodeFetchScores,
                        FootprintReasonCode::DocumentIsPermitOrProvisionalLicense, // not really future proof
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
            if !doc_passed_with_review {
                collect_ad_hoc_document(state, user_kind, &wf, &obd, t_id, risk_signals_for_doc, expect_mr)
                    .await
            }
        }
    }
}

#[allow(clippy::too_many_arguments)]
async fn collect_ad_hoc_document(
    state: &mut State,
    user_kind: UserKind,
    prior_wf: &Workflow,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
    previous_risk_signals: Vec<RiskSignal>,
    old_expects_mr: bool,
) {
    // Trigger Redo workflow
    let sv_id = prior_wf.scoped_vault_id.clone();
    let fixture_result = prior_wf.fixture_result;
    let obc_id = prior_wf.ob_configuration_id.clone();
    let wf = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let args = NewWorkflowArgs {
                scoped_vault_id: sv_id.clone(),
                config: DocumentConfig {
                    configs: vec![DocumentRequestConfig::Identity {
                        collect_selfie: false,
                    }],
                }
                .into(),
                fixture_result,
                ob_configuration_id: obc_id,
                insight_event_id: None,
                authorized: false,
                source: WorkflowSource::Hosted,
                is_one_click: false,
                is_neuro_enabled: false,
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
    let mut mock_ff_client = MockFFClient::new();

    let tenant_id = tenant_id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    let mut expect_committed = true;

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            mock_incode_doc_collection(state, svid, Success.footprint_reason_codes(), wfid.clone(), true)
                .await;
            expect_committed = false;
        }
        // Mock vendor calls for Live users
        UserKind::Live => {
            // we aren't re-running KYC, just doc
            mock_incode_doc_collection(state, svid, Success.footprint_reason_codes(), wfid.clone(), true)
                .await
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
    // Expect Webhooks
    mock_webhooks(
        state,
        // Status hasn't changed, but manual review is requested. So We'll fire status changed _if_ manual
        // review wasn't previously requested
        (!old_expects_mr)
            .then_some(OnboardingStatusChanged(
                ExpectedStatus(prior_wf.status),
                ExpectedRequiresManualReview(true),
            ))
            .into_iter()
            .collect_vec(),
        // Ad-hoc document workflows always end with a status of None and request manual review
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::None),
            ExpectedRequiresManualReview(true),
        )],
    );

    let _: WorkflowWrapper = ww
        .run(state, WorkflowActions::DocCollected(DocCollected {}))
        .await
        .unwrap();

    let (wf, _, _, obd, rs) = query_data(state, &svid2, &wfid).await;
    let portablized_seqno = query_portablized_seqno(state, &wf.scoped_vault_id).await;
    assert_eq!(
        WorkflowState::Document(newtypes::DocumentState::Complete),
        wf.state
    );
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert_eq!(obd.status, DecisionStatus::None);
    assert_eq!(expect_committed, portablized_seqno.is_some());
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(wf.status, OnboardingStatus::None);

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
        UserKind::Sandbox(WorkflowFixtureResult::UseRulesOutcome) => {
            // In this case, we run real rules to get a decision. In this case, we do not generate synthetic
            // KYC signals. I think this is fine since the purpose of doing sandbox real document
            // is just to see the doc outcome, not to get synthetic KYC risk signals
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
