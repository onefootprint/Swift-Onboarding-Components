use crate::decision::rule_engine::validation::validate_rules_request;
use crate::decision::state::actions::Authorize;
use crate::decision::state::actions::MakeVendorCalls;
use crate::decision::state::test_utils::get_current_seqno;
use crate::decision::state::test_utils::mock_custom_doc_collection;
use crate::decision::state::test_utils::mock_idology;
use crate::decision::state::test_utils::mock_incode_doc_collection;
use crate::decision::state::test_utils::mock_webhooks;
use crate::decision::state::test_utils::query_data;
use crate::decision::state::test_utils::query_doc_requests;
use crate::decision::state::test_utils::query_rule_set_result;
use crate::decision::state::test_utils::query_timeline_events;
use crate::decision::state::test_utils::setup_data;
use crate::decision::state::test_utils::ExpectedRequiresManualReview;
use crate::decision::state::test_utils::ExpectedStatus;
use crate::decision::state::test_utils::OnboardingCompleted;
use crate::decision::state::test_utils::OnboardingStatusChanged;
use crate::decision::state::test_utils::WithQualifier;
use crate::decision::state::MakeDecision;
use crate::decision::state::WorkflowActions;
use crate::decision::state::WorkflowWrapper;
use crate::State;
use api_wire_types::CreateRule;
use api_wire_types::MultiUpdateRuleRequest;
use api_wire_types::RuleActionMigration;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::NewRule;
use db::models::rule_instance::RuleInstance;
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::test_db_pool::TestDbPool;
use db::tests::MockFFClient;
use feature_flag::BoolFlag;
use macros::test_state;
use macros::test_state_case;
use newtypes::BooleanOperator;
use newtypes::CollectedDataOption as CDO;
use newtypes::CustomDocumentConfig;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::DbUserTimelineEvent;
use newtypes::DbUserTimelineEventKind;
use newtypes::DecisionStatus;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentRequestKind;
use newtypes::DocumentUploadSettings;
use newtypes::FootprintReasonCode as FRC;
use newtypes::KycState;
use newtypes::OnboardingStatus;
use newtypes::RuleAction;
use newtypes::RuleActionConfig;
use newtypes::RuleExpression;
use newtypes::RuleExpressionCondition;
use newtypes::StepUpKind;
use newtypes::UnvalidatedRuleExpression;
use newtypes::WorkflowState;
use std::str::FromStr;

fn custom_doc_config(identifier: &str) -> DocumentRequestConfig {
    DocumentRequestConfig::Custom(CustomDocumentConfig {
        identifier: DataIdentifier::from_str(identifier).unwrap(),
        name: "Hi".to_owned(),
        description: None,
        requires_human_review: true,
        upload_settings: DocumentUploadSettings::PreferCapture,
    })
}

fn id_poa_configs() -> Vec<DocumentRequestConfig> {
    vec![
        DocumentRequestConfig::Identity {
            collect_selfie: true,
            document_types_and_countries: None,
        },
        DocumentRequestConfig::ProofOfAddress {
            requires_human_review: true,
        },
    ]
}

#[test_state_case(RuleActionMigration::Legacy(RuleAction::StepUp(StepUpKind::Identity)))]
#[test_state_case(RuleActionMigration::Legacy(RuleAction::StepUp(StepUpKind::IdentityProofOfSsn)))]
#[test_state_case(RuleActionMigration::Legacy(RuleAction::StepUp(
    StepUpKind::IdentityProofOfSsnProofOfAddress
)))]
#[test_state_case(RuleActionMigration::New(RuleActionConfig::StepUp(
    vec![custom_doc_config("document.custom.hi")]
)))]
#[test_state_case(RuleActionMigration::New(RuleActionConfig::StepUp(id_poa_configs())))]
#[test_state_case(RuleActionMigration::New(RuleActionConfig::StepUp(
    vec![custom_doc_config("document.custom.hi"), custom_doc_config("document.custom.world")]
)))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn test_stepup_with_multiple_docs(state: &State, action: RuleActionMigration) {
    // DATA SETUP
    let must_collect_data = vec![CDO::PhoneNumber, CDO::Ssn9];

    let (wf, t, obc, _tu) = setup_data(
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
    let expr = vec![RuleExpressionCondition::RiskSignal {
        field: FRC::DobCouldNotMatch,
        op: BooleanOperator::Equals,
        value: true,
    }];
    let new_rule = CreateRule {
        name: None,
        rule_expression: UnvalidatedRuleExpression(expr),
        rule_action: action.clone(),
        is_shadow: false,
    };
    let raw_update = MultiUpdateRuleRequest {
        expected_rule_set_version: 1,
        add: Some(vec![new_rule]),
        edit: None,
        delete: None,
    };
    // Set up expectations
    let expected_doc_configs = match action {
        RuleActionMigration::Legacy(RuleAction::StepUp(suk)) => suk.to_doc_configs(),
        RuleActionMigration::New(RuleActionConfig::StepUp(ref configs)) => configs.clone(),
        _ => panic!("incorrect action - needs to be stepup"),
    };

    let step_up_includes_document_with_review =
        expected_doc_configs.iter().any(|c| c.requires_human_review());
    let includes_identity_document = expected_doc_configs.iter().any(|c| c.is_identity());
    let includes_non_identity_document = expected_doc_configs.iter().any(|c| !c.is_identity());


    //
    // Add in a rule for dob not matching which will step up to `step_up_kind`
    //
    let t_id = t.id.clone();
    state
        .db_transaction(move |conn| {
            let obc = ObConfiguration::lock(conn, &obc_id).unwrap();
            let update = validate_rules_request(conn, &t_id, true, raw_update)?;
            RuleInstance::bulk_edit(conn, &obc, &DbActor::Footprint, update)?;

            Ok(())
        })
        .await
        .unwrap();

    let seqno = get_current_seqno(state).await;
    let ww = WorkflowWrapper::init(state, wf, seqno).await.unwrap();

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
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize { seqno }))
        .await
        .unwrap();

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno }))
        .await
        .unwrap();

    // MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision { seqno }))
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
    assert_eq!(OnboardingStatus::Incomplete, wf.status);
    // We have the correct pending doc requests
    assert_have_same_elements(
        doc_requests
            .iter()
            .map(|d| DocumentRequestKind::from(&d.config))
            .collect(),
        expected_doc_configs
            .into_iter()
            .map(DocumentRequestKind::from)
            .collect(),
    );
    // assert correct action was applied
    match action {
        RuleActionMigration::Legacy(RuleAction::StepUp(step_up_kind)) => {
            assert_eq!(
                rule_set_result.action_triggered.unwrap(),
                RuleAction::StepUp(step_up_kind)
            );
        }
        RuleActionMigration::New(a) => {
            assert_eq!(rule_set_result.rule_action_triggered.unwrap(), a);
        }
        _ => panic!("incorrect action - needs to be stepup"),
    };


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
    // TODO: not quite right since we need to not let wf run to completion if there's still doc requests
    // pending
    if includes_identity_document {
        mock_incode_doc_collection(
            state,
            svid.clone(),
            vec![FRC::DocumentVerified],
            wf.id.clone(),
            false,
        )
        .await;
    }


    // Now mock custom document being collected, if applicable!
    // TODO: not quite right since we need to not let wf run to completion if there's still doc requests
    // pending
    if includes_non_identity_document {
        mock_custom_doc_collection(state, doc_requests, t.id.clone(), svid.clone(), wf.id.clone()).await;
    }

    // Expect Webhooks
    let (expected_status, needs_review) = if step_up_includes_document_with_review {
        (DecisionStatus::Fail, true)
    } else {
        (DecisionStatus::Pass, false)
    };
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(expected_status.into()),
            ExpectedRequiresManualReview(needs_review),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_status.into()),
            ExpectedRequiresManualReview(needs_review),
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
    assert!(rule_set_result.rule_action_triggered.is_none());

    // We're complete now
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert_eq!(obd.status, expected_status);

    if step_up_includes_document_with_review {
        assert!(obd.failed_for_doc_review);
    }
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
        .db_transaction(move |conn| {
            let action = RuleAction::StepUp(identity_stepup);
            let kyc_stepup_rule = NewRule {
                rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                    field: FRC::DobCouldNotMatch,
                    op: BooleanOperator::Equals,
                    value: true,
                }]),
                action,
                rule_action: action.to_rule_action(),
                name: None,
                is_shadow: false,
            };

            // here we rely on the ordering of RuleActions to choose StepUp the first time, then
            // the next time, we'll be ineligible to stepup because we already collected a doc
            let poa_action = RuleAction::StepUp(proof_of_address_stepup);
            let poa_stepup_rule = NewRule {
                rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                    field: FRC::DocumentOcrDobDoesNotMatch,
                    op: BooleanOperator::Equals,
                    value: true,
                }]),
                action: poa_action,
                rule_action: poa_action.to_rule_action(),
                name: None,
                is_shadow: false,
            };

            let poa_review_action = RuleAction::ManualReview;
            let poa_review_rule = NewRule {
                rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                    field: FRC::DocumentOcrDobDoesNotMatch,
                    op: BooleanOperator::Equals,
                    value: true,
                }]),
                action: poa_review_action,
                rule_action: poa_review_action.to_rule_action(),
                name: None,
                is_shadow: false,
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

    let seqno = get_current_seqno(state).await;
    let ww = WorkflowWrapper::init(state, wf, seqno).await.unwrap();

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
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize { seqno }))
        .await
        .unwrap();

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno }))
        .await
        .unwrap();

    // MakeDecision
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision { seqno }))
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
    assert_eq!(OnboardingStatus::Incomplete, wf.status);
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

    let (wf, _, mrs, obd, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert_eq!(obd.status, DecisionStatus::Fail);
    assert!(!mrs.is_empty());
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
