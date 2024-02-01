use crate::{
    decision::{
        state::{
            actions::{Authorize, MakeVendorCalls},
            kyc,
            test_utils::{
                mock_idology, mock_incode_doc_collection, mock_webhooks, query_data, query_doc_requests,
                query_risk_signals, query_rule_set_result, setup_data, DocumentCollectionKind,
                DocumentOutcome::*, ExpectedRequiresManualReview, ExpectedStatus, OnboardingCompleted,
                OnboardingStatusChanged, UserKind, WithQualifier,
            },
            MakeDecision, WorkflowActions, WorkflowKind, WorkflowWrapper,
        },
        tests::test_helpers,
    },
    errors::ApiResult,
    State,
};
use chrono::Utc;
use db::{
    models::{
        onboarding_decision::OnboardingDecision,
        risk_signal::RiskSignal,
        rule_instance::RuleInstance,
        rule_set_result::RuleSetResult,
        workflow::{NewWorkflow, NewWorkflowArgs, Workflow, Workflow as DbWorkflow},
        workflow_event::WorkflowEvent,
    },
    test_helpers::assert_have_same_elements,
    tests::{fixtures::ob_configuration::ObConfigurationOpts, test_db_pool::TestDbPool, MockFFClient},
    DbResult,
};
use feature_flag::BoolFlag;
use itertools::Itertools;
use macros::{test_state, test_state_case};
use newtypes::{
    BooleanOperator, CollectedDataOption as CDO, CountryRestriction, DbActor, DecisionStatus,
    DocTypeRestriction, DocumentCdoInfo, FootprintReasonCode, KycConfig, KycState, ObConfigurationKey,
    OnboardingStatus, RiskSignalGroupKind, RuleAction, RuleExpression, RuleExpressionCondition, Selfie,
    SignalSeverity, StepUpKind, TenantId, VendorAPI, WorkflowConfig, WorkflowFixtureResult, WorkflowId,
    WorkflowSource, WorkflowState,
};

async fn create_wf(state: &State, s: newtypes::WorkflowState) -> DbWorkflow {
    let (_, _, _, sv, obc) = test_helpers::create_kyc_user_and_wf(
        state,
        ObConfigurationOpts {
            is_live: true,
            ..Default::default()
        },
        None,
    )
    .await;

    state
        .db_pool
        .db_transaction(move |conn| {
            DbWorkflow::insert(
                conn,
                NewWorkflow {
                    created_at: Utc::now(),
                    scoped_vault_id: sv.id,
                    kind: (&s).into(),
                    state: s,
                    config: WorkflowConfig::Kyc(KycConfig { is_redo: false }),
                    fixture_result: None,
                    status: Some(OnboardingStatus::Incomplete),
                    ob_configuration_id: Some(obc.id),
                    insight_event_id: None,
                    authorized_at: None,
                    source: WorkflowSource::Hosted,
                    is_one_click: false,
                },
            )
        })
        .await
        .unwrap()
}

async fn get_wf(state: &State, wfid: WorkflowId) -> (DbWorkflow, Vec<WorkflowEvent>) {
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let wf = DbWorkflow::get(conn, &wfid)?;
            let wfe = WorkflowEvent::list_for_workflow(conn, &wfid)?;
            Ok((wf, wfe))
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

#[test_state_case(UserKind::Demo, DocumentCollectionKind::DocumentNotRequested)]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::Pass),
    DocumentCollectionKind::DocumentNotRequested
)]
#[test_state_case(UserKind::Live, DocumentCollectionKind::DocumentNotRequested)]
// with doc
#[test_state_case(UserKind::Live, DocumentCollectionKind::DocumentRequested(Success))]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::Pass),
    DocumentCollectionKind::DocumentRequested(Success)
)]
#[test_state_case(UserKind::Demo, DocumentCollectionKind::DocumentRequested(Success))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn pass(state: &mut State, user_kind: UserKind, doc_collection_kind: DocumentCollectionKind) {
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
    let svid2 = svid.clone();
    let document_requested = doc_collection_kind.doc_requested();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFFClient::new();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .times(3)
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            // incode isn't mockable like other vendors atm, so we need to setup some things here
            if let Some(doc_outcome) = document_requested {
                mock_incode_doc_collection(
                    state,
                    svid2,
                    doc_outcome.footprint_reason_codes(),
                    wfid.clone(),
                    true,
                )
                .await;
            }
        }
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                    .return_once(move |_| true);
            });

            mock_idology(state, WithQualifier(None));

            if let Some(doc_outcome) = document_requested {
                mock_incode_doc_collection(
                    state,
                    svid2,
                    doc_outcome.footprint_reason_codes(),
                    wfid.clone(),
                    true,
                )
                .await;
            }
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());

    // TESTS
    //
    // Authorize
    // Expect Webhook
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

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state);

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Decisioning), wf.state);
    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| !r.hidden));

    if document_requested.is_some() {
        let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Doc).await;
        assert!(!rs.is_empty());
        assert!(rs.iter().all(|r| !r.hidden));
    }

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

    // MakeDecision
    let (_, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());
    assert!(obd.unwrap().seqno.is_some());
    assert!(mr.is_none());

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {
            assert!(rs
                .iter()
                .all(|rs| rs.reason_code.severity() == SignalSeverity::Info));

            assert!(rs.iter().all(|rs| matches!(
                rs.vendor_api,
                VendorAPI::IdologyExpectId | VendorAPI::IncodeFetchScores
            )));
        }
        UserKind::Live => {
            assert_have_same_elements(
                vec![
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches)),
                    document_requested.map(|_| {
                        (
                            VendorAPI::IncodeFetchScores,
                            FootprintReasonCode::DocumentVerified,
                        )
                    }),
                ]
                .into_iter()
                .flatten()
                .collect(),
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    };

    // Rules Engine was run and a result saved and nothing catastrophic happened
    let _ = state
        .db_pool
        .db_query(move |conn| RuleSetResult::latest_workflow_decision(conn, &svid))
        .await
        .unwrap()
        .unwrap();
}

#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    DocumentCollectionKind::DocumentNotRequested
)]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::Fail),
    DocumentCollectionKind::DocumentNotRequested
)]
#[test_state_case(UserKind::Live, DocumentCollectionKind::DocumentNotRequested)]
// with doc
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    DocumentCollectionKind::DocumentRequested(Success)
)]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::Fail),
    DocumentCollectionKind::DocumentRequested(Success)
)]
#[test_state_case(UserKind::Live, DocumentCollectionKind::DocumentRequested(Success))]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::ManualReview),
    DocumentCollectionKind::DocumentRequested(Failure)
)]
#[test_state_case(
    UserKind::Sandbox(WorkflowFixtureResult::Fail),
    DocumentCollectionKind::DocumentRequested(Failure)
)]
#[test_state_case(UserKind::Live, DocumentCollectionKind::DocumentRequested(Failure))]
#[test_state_case(UserKind::Live, DocumentCollectionKind::DocumentRequested(DocUploadFailed))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn kyc_fail(state: &mut State, user_kind: UserKind, doc_collection_kind: DocumentCollectionKind) {
    // DATA SETUP
    let mut must_collect_data = vec![CDO::PhoneNumber, CDO::Ssn9];
    match doc_collection_kind {
        DocumentCollectionKind::DocumentRequested(_) => must_collect_data.push(CDO::Document(
            DocumentCdoInfo(DocTypeRestriction::None, CountryRestriction::None, Selfie::None),
        )),
        DocumentCollectionKind::DocumentNotRequested => {}
    }

    let (wf, tenant, obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            must_collect_data,
            ..Default::default()
        },
        user_kind.fixture_result(),
    )
    .await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let svid2 = wf.scoped_vault_id.clone();
    let document_requested = doc_collection_kind.doc_requested();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFFClient::new();

    let tenant_id = tenant.id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .times(3)
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {
            if let Some(doc_outcome) = document_requested {
                mock_incode_doc_collection(
                    state,
                    svid2,
                    doc_outcome.footprint_reason_codes(),
                    wfid.clone(),
                    true,
                )
                .await;
            }
        }
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                    .return_once(move |_| true);
            });

            mock_idology(
                state,
                WithQualifier(Some("resultcode.ssn.does.not.match".to_owned())),
            );

            if let Some(doc_outcome) = document_requested {
                mock_incode_doc_collection(
                    state,
                    svid2,
                    doc_outcome.footprint_reason_codes(),
                    wfid.clone(),
                    true,
                )
                .await;
            }
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());

    // TESTS
    //
    // Authorize
    // Expect Webhooks
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
    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state);

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();

    let rs_failing = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs_failing.is_empty());
    assert!(rs_failing.iter().all(|r| !r.hidden));

    if document_requested
    .map(|dr| !dr.doc_upload_failed()) // no risk signals if doc upload failed
    .unwrap_or(false)
    {
        let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Doc).await;
        assert!(!rs.is_empty());
        assert!(rs.iter().all(|r| !r.hidden));
    }

    // Expect Webhook
    let expect_review = matches!(user_kind, UserKind::Sandbox(WorkflowFixtureResult::ManualReview)); //#fail currently indicates hard failing without raising review
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(expect_review),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(OnboardingStatus::Fail),
            ExpectedRequiresManualReview(expect_review),
        )],
    );

    // MakeDecision
    let (_, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (wf, _, mr, obd, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    let obd = obd.unwrap();
    assert!(obd.status == DecisionStatus::Fail);
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert!(obd.seqno.is_none());
    assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
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
            assert!(rs.iter().all(|rs| matches!(
                rs.vendor_api,
                VendorAPI::IdologyExpectId | VendorAPI::IncodeFetchScores
            )));
            assert!(rs
                .iter()
                .filter(|rs| !rs.vendor_api.is_incode_doc_flow_api())
                .all(|rs| rs.reason_code.severity() == severity));
        }
        UserKind::Live => {
            let doc_reason_code = document_requested
                .map(|outcome| {
                    outcome
                        .footprint_reason_codes()
                        .into_iter()
                        .map(|frc| (VendorAPI::IncodeFetchScores, frc))
                        .collect_vec()
                })
                .unwrap_or_default();

            assert_have_same_elements(
                vec![
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::SsnDoesNotMatch)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches)),
                    Some((VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches)),
                ]
                .into_iter()
                .flatten()
                .chain(doc_reason_code.into_iter())
                .collect(),
                rs.into_iter()
                    .map(|rs| (rs.vendor_api, rs.reason_code))
                    .collect_vec(),
            );
        }
    }

    // this combination of retrying kyc with a failed document isn't handled yet, so we need to special case it
    let doc_failed = document_requested
        .map(|o| o.doc_failed_for_some_reason())
        .unwrap_or(false);

    // Test Redo as well
    match user_kind {
        // TODO: we don't really currently provide a way to specicfy fixtures for a Redo flow
        UserKind::Demo | UserKind::Sandbox(_) => {}
        UserKind::Live => {
            if !doc_failed {
                redo_and_pass(
                    state,
                    user_kind,
                    &wf,
                    &obd,
                    &tenant.id,
                    &obc.key,
                    rs_failing,
                    document_requested.is_some(),
                )
                .await;
            }
        }
    }
}

#[test_state_case(StepUpKind::Identity)]
#[test_state_case(StepUpKind::IdentityProofOfSsn)]
#[test_state_case(StepUpKind::IdentityProofOfSsnProofOfAddress)]
#[test_state_case(StepUpKind::ProofOfSsnProofOfAddress)]
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
            RuleInstance::create(
                conn,
                obc_id,
                DbActor::Footprint,
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
    let (_, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    let doc_requests = query_doc_requests(state, &wfid).await;
    let (rule_set_result, _) = query_rule_set_result(state, &wf.scoped_vault_id).await.unwrap();

    // We're in stepup
    assert_eq!(WorkflowState::Kyc(KycState::DocCollection), wf.state);
    // We have the correct pending doc requests
    assert_have_same_elements(
        doc_requests.into_iter().map(|d| d.kind).collect(),
        step_up_kind
            .to_doc_kinds()
            .into_iter()
            .map(|k| k.into())
            .collect(),
    );
    // assert correct action was applied
    assert_eq!(
        rule_set_result.action_triggered.unwrap(),
        RuleAction::StepUp(step_up_kind)
    )
}

#[allow(clippy::too_many_arguments)]
async fn redo_and_pass(
    state: &mut State,
    user_kind: UserKind,
    prior_wf: &Workflow,
    prior_obd: &OnboardingDecision,
    tenant_id: &TenantId,
    ob_config_key: &ObConfigurationKey,
    previous_risk_signals: Vec<RiskSignal>,
    doc_requested: bool,
) {
    // Trigger Redo workflow
    let sv_id = prior_wf.scoped_vault_id.clone();
    let fixture_result = prior_wf.fixture_result;
    let obc_id = prior_wf.ob_configuration_id.clone();
    let wf = state
        .db_pool
        .db_transaction(move |conn| {
            let args = NewWorkflowArgs {
                scoped_vault_id: sv_id,
                config: KycConfig { is_redo: true }.into(),
                fixture_result,
                ob_configuration_id: obc_id,
                insight_event_id: None,
                authorized: false,
                source: WorkflowSource::Hosted,
                is_one_click: false,
            };
            Workflow::create(conn, args)
        })
        .await
        .unwrap();

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFFClient::new();

    let tenant_id = tenant_id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .times(3)
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        // If Demo or Sandbox we expect no vendor calls to be attempted
        UserKind::Demo | UserKind::Sandbox(_) => {}
        // Mock vendor calls for Live users
        UserKind::Live => {
            let ob_config_key = ob_config_key.clone();
            // TODO: later we should just mock is_production=true for these tests and not need this FF mock.
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                    .return_once(move |_| true);
            });

            mock_idology(state, WithQualifier(None));
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());
    // webhook is specifically not mocked as we should not fire the OnboardingComplete webhook in redo

    // run Authorize
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

    let _: WorkflowWrapper = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, _, obd, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    // new obd was written
    let obd = obd.unwrap();
    assert!(obd.id != prior_obd.id);
    assert!(obd.status == DecisionStatus::Pass);
    assert!(obd.seqno.is_some());
    assert!(matches!(obd.actor, DbActor::Footprint));
    assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());

    // check RSG is different
    let rs_passing = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    let previous_rs_ids: Vec<newtypes::RiskSignalId> =
        previous_risk_signals.into_iter().map(|r| r.id).collect();
    assert!(!rs_passing.is_empty());
    rs_passing
        .into_iter()
        .for_each(|r| assert!(!previous_rs_ids.contains(&r.id) && !r.hidden));

    assert_have_same_elements(
        vec![
            Some((VendorAPI::IdologyExpectId, FootprintReasonCode::AddressMatches)),
            Some((VendorAPI::IdologyExpectId, FootprintReasonCode::SsnMatches)),
            Some((VendorAPI::IdologyExpectId, FootprintReasonCode::NameMatches)),
            Some((VendorAPI::IdologyExpectId, FootprintReasonCode::DobMatches)),
            doc_requested.then_some((
                VendorAPI::IncodeFetchScores,
                FootprintReasonCode::DocumentVerified,
            )),
        ]
        .into_iter()
        .flatten()
        .collect(),
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec(),
    );
}
