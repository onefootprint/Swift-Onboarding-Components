use crate::{
    decision::state::{
        actions::{Authorize, MakeVendorCalls},
        test_utils::{
            mock_idology, mock_incode_doc_collection, mock_webhooks, query_data, query_doc_requests,
            query_rule_set_result, query_timeline_events, setup_data, ExpectedRequiresManualReview,
            ExpectedStatus, OnboardingCompleted, OnboardingStatusChanged, WithQualifier,
        },
        MakeDecision, WorkflowActions, WorkflowWrapper,
    },
    errors::ApiResult,
    State,
};

use db::{
    models::{
        ob_configuration::ObConfiguration,
        rule_instance::{NewRule, RuleInstance},
    },
    test_helpers::assert_have_same_elements,
    tests::{fixtures::ob_configuration::ObConfigurationOpts, test_db_pool::TestDbPool, MockFFClient},
};
use feature_flag::BoolFlag;

use macros::{test_state, test_state_case};
use newtypes::{
    BooleanOperator, CollectedDataOption as CDO, DbActor, DbUserTimelineEvent, DbUserTimelineEventKind,
    DecisionStatus, DocumentRequestKind, FootprintReasonCode, FootprintReasonCode as FRC, KycState,
    OnboardingStatus, RuleAction, RuleExpression, RuleExpressionCondition, StepUpKind, WorkflowState,
};

#[test_state_case(StepUpKind::Identity)]
#[test_state_case(StepUpKind::IdentityProofOfSsn)]
#[test_state_case(StepUpKind::IdentityProofOfSsnProofOfAddress)]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn test_stepup_with_multiple_docs(state: &State, step_up_kind: StepUpKind) {
    // DATA SETUP
    let must_collect_data = vec![CDO::PhoneNumber, CDO::Ssn9];

    let (wf, _, obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: true,
            must_collect_data,
            ..Default::default()
        },
        None,
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let obc_id = obc.id.clone();

    //
    // Add in a rule for dob not matching which will step up to `step_up_kind`
    //
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let expr = RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                field: FootprintReasonCode::DobCouldNotMatch,
                op: BooleanOperator::Equals,
                value: true,
            }]);
            let obc = ObConfiguration::lock(conn, &obc_id).unwrap();
            RuleInstance::create(
                conn,
                &obc,
                &DbActor::Footprint,
                None,
                expr,
                RuleAction::StepUp(step_up_kind),
            )
            .unwrap();

            Ok(())
        })
        .await
        .unwrap();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // Mock vendor calls
    let ob_config_key = obc.key.clone();
    let mut mock_ff_client = MockFFClient::new();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
            .return_once(move |_| true);
    });
    state.set_ff_client(mock_ff_client.into_mock());

    mock_idology(
        state,
        WithQualifier(Some("resultcode.no.dob.available".to_owned())),
    );

    // TESTS
    //
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pending),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    // Expect Webhook from moving to stepup
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Incomplete),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );

    // MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    let doc_requests = query_doc_requests(state, &wfid).await;
    let (rule_set_result, _) = query_rule_set_result(state, &wf.scoped_vault_id).await.unwrap();

    // docreqs have correct rule_set_result_id
    assert!(doc_requests
        .iter()
        .all(|dr| dr.rule_set_result_id.clone().unwrap() == rule_set_result.id));

    // We're in stepup
    assert_eq!(WorkflowState::Kyc(KycState::DocCollection), wf.state);
    // We have the correct pending doc requests
    assert_have_same_elements(
        doc_requests.iter().map(|d| d.kind).collect(),
        step_up_kind.to_doc_kinds(),
    );
    // assert correct action was applied
    assert_eq!(
        rule_set_result.action_triggered.unwrap(),
        RuleAction::StepUp(step_up_kind)
    );
    // user timeline event was created
    let mut uts = query_timeline_events(state, &svid, vec![DbUserTimelineEventKind::StepUp]).await;
    assert_eq!(1, uts.len());
    let DbUserTimelineEvent::StepUp(e) = uts.pop().unwrap().0.event else {
        panic!("Wrong timeline event created");
    };
    assert_have_same_elements(
        doc_requests.iter().map(|dr| dr.id.clone()).collect(),
        e.document_request_ids,
    );

    // Now mock document being collected
    // TODO: not quite right since we need to not let wf run to completion if there's still doc requests pending
    mock_incode_doc_collection(
        state,
        svid.clone(),
        vec![FRC::DocumentVerified],
        wf.id.clone(),
        false,
    )
    .await;

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Pass),
            ExpectedRequiresManualReview(false),
        )],
    );

    let _ = ww
        .run(
            state,
            WorkflowActions::DocCollected(crate::decision::state::DocCollected {}),
        )
        .await
        .unwrap();

    let (wf, _, _, obd, _) = query_data(state, &svid, &wfid).await;
    let (rule_set_result, _) = query_rule_set_result(state, &wf.scoped_vault_id).await.unwrap();
    assert!(rule_set_result.action_triggered.is_none());

    // We're in stepup
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    assert_eq!(obd.unwrap().status, DecisionStatus::Pass)
}

// Simulate collecting ID Doc
// Having a rule to runs on the ID Doc
// Then stepping up again
#[test_state]
async fn test_multi_stage_step_up(state: &mut State) {
    let identity_stepup = StepUpKind::Identity;
    let proof_of_address_stepup = StepUpKind::ProofOfAddress;

    // DATA SETUP
    let must_collect_data = vec![CDO::PhoneNumber, CDO::Ssn9];

    let (wf, _, obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: true,
            must_collect_data,
            ..Default::default()
        },
        None,
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let obc_id = obc.id.clone();

    //
    // Add in a rule for dob not matching which will step up to id doc from KYC
    //
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let kyc_stepup_rule = NewRule {
                rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                    field: FootprintReasonCode::DobCouldNotMatch,
                    op: BooleanOperator::Equals,
                    value: true,
                }]),
                action: RuleAction::StepUp(identity_stepup),
                name: None,
            };

            // here we rely on the ordering of RuleActions to choose StepUp the first time, then
            // the next time, we'll be ineligible to stepup because we already collected a doc
            let poa_stepup_rule = NewRule {
                rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                    field: FootprintReasonCode::DocumentOcrDobDoesNotMatch,
                    op: BooleanOperator::Equals,
                    value: true,
                }]),
                action: RuleAction::StepUp(proof_of_address_stepup),
                name: None,
            };

            let poa_review_rule = NewRule {
                rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                    field: FootprintReasonCode::DocumentOcrDobDoesNotMatch,
                    op: BooleanOperator::Equals,
                    value: true,
                }]),
                action: RuleAction::ManualReview,
                name: None,
            };

            let obc = ObConfiguration::lock(conn, &obc_id).unwrap();
            RuleInstance::bulk_create(
                conn,
                &obc,
                &DbActor::Footprint,
                vec![kyc_stepup_rule, poa_stepup_rule, poa_review_rule],
            )
            .unwrap();

            Ok(())
        })
        .await
        .unwrap();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // Mock vendor calls
    let ob_config_key = obc.key.clone();
    let mut mock_ff_client = MockFFClient::new();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
            .return_once(move |_| true);
    });
    state.set_ff_client(mock_ff_client.into_mock());

    mock_idology(
        state,
        WithQualifier(Some("resultcode.no.dob.available".to_owned())),
    );

    // TESTS
    //
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pending),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    // Expect Webhook from moving to stepup
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Incomplete),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );

    // MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    let doc_requests = query_doc_requests(state, &wfid).await;
    assert_eq!(doc_requests.len(), 1);
    let identity_dr = &doc_requests[0];
    assert_eq!(identity_dr.kind, DocumentRequestKind::Identity);
    let (rule_set_result, _) = query_rule_set_result(state, &wf.scoped_vault_id).await.unwrap();

    // docreqs have correct rule_set_result_id
    assert!(doc_requests
        .iter()
        .all(|dr| dr.rule_set_result_id.clone().unwrap() == rule_set_result.id));

    // We're in stepup
    assert_eq!(WorkflowState::Kyc(KycState::DocCollection), wf.state);
    // assert correct action was applied
    assert_eq!(
        rule_set_result.action_triggered.unwrap(),
        RuleAction::StepUp(identity_stepup)
    );
    // user timeline event was created
    let mut uts = query_timeline_events(state, &svid, vec![DbUserTimelineEventKind::StepUp]).await;
    assert_eq!(1, uts.len());
    let DbUserTimelineEvent::StepUp(e) = uts.pop().unwrap().0.event else {
        panic!("Wrong timeline event created");
    };
    assert_have_same_elements(
        doc_requests.iter().map(|dr| dr.id.clone()).collect(),
        e.document_request_ids,
    );

    // Now mock document being collected
    mock_incode_doc_collection(
        state,
        svid.clone(),
        vec![FRC::DocumentVerified, FRC::DocumentOcrDobDoesNotMatch],
        wf.id.clone(),
        false,
    )
    .await;

    // Running this we'll collect the doc
    let ww = ww
        .run(
            state,
            WorkflowActions::DocCollected(crate::decision::state::DocCollected {}),
        )
        .await
        .unwrap();

    let (wf, mut wfe, _, _obd, _) = query_data(state, &svid, &wfid).await;
    let latest_wfe = wfe.pop().unwrap();
    assert_eq!(
        (latest_wfe.from_state, latest_wfe.to_state),
        (
            WorkflowState::Kyc(KycState::Decisioning),
            WorkflowState::Kyc(KycState::DocCollection)
        )
    );
    let (rule_set_result, _) = query_rule_set_result(state, &wf.scoped_vault_id).await.unwrap();
    let doc_requests = query_doc_requests(state, &wfid).await;
    assert_eq!(doc_requests.len(), 2);
    let new_doc_request: Vec<_> = doc_requests
        .into_iter()
        .filter(|dr| dr.id != identity_dr.id)
        .collect();
    assert_eq!(new_doc_request.len(), 1);
    assert_eq!(new_doc_request[0].kind, DocumentRequestKind::ProofOfAddress);
    assert_eq!(
        rule_set_result.action_triggered.unwrap(),
        RuleAction::StepUp(proof_of_address_stepup)
    );

    // docreqs have correct rule_set_result_id
    assert!(new_doc_request
        .iter()
        .all(|dr| dr.rule_set_result_id.clone().unwrap() == rule_set_result.id));

    // We're in stepup
    assert_eq!(WorkflowState::Kyc(KycState::DocCollection), wf.state);
    // user timeline event was created
    let mut uts = query_timeline_events(state, &svid, vec![DbUserTimelineEventKind::StepUp]).await;
    assert_eq!(2, uts.len());
    let DbUserTimelineEvent::StepUp(e) = uts.remove(0).0.event else {
        panic!("Wrong timeline event created");
    };
    assert_have_same_elements(
        new_doc_request.iter().map(|dr| dr.id.clone()).collect(),
        e.document_request_ids,
    );

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(true),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(true),
        )],
    );

    let _ = ww
        .run(
            state,
            WorkflowActions::DocCollected(crate::decision::state::DocCollected {}),
        )
        .await
        .unwrap();

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert_eq!(obd.status, DecisionStatus::Fail);
    assert!(mr.is_some());
    assert_have_same_elements(
        rs.into_iter().map(|r| r.reason_code).collect(),
        vec![
            FRC::DobCouldNotMatch,
            FRC::AddressMatches,
            FRC::SsnMatches,
            FRC::NameMatches,
            FRC::DocumentVerified,
            FRC::DocumentOcrDobDoesNotMatch,
        ],
    );

    let (rule_set_result, _) = query_rule_set_result(state, &wf.scoped_vault_id).await.unwrap();
    assert_eq!(rule_set_result.action_triggered, Some(RuleAction::ManualReview));
}
