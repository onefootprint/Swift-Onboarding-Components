use crate::{
    decision::state::{
        actions::{Authorize, MakeVendorCalls},
        test_utils::{
            mock_idology, mock_webhooks, query_data, query_doc_requests, query_rule_set_result, setup_data,
            ExpectedRequiresManualReview, ExpectedStatus, OnboardingStatusChanged, WithQualifier,
        },
        MakeDecision, WorkflowActions, WorkflowWrapper,
    },
    errors::ApiResult,
    State,
};

use db::{
    models::rule_instance::RuleInstance,
    test_helpers::assert_have_same_elements,
    tests::{fixtures::ob_configuration::ObConfigurationOpts, MockFFClient},
};
use feature_flag::BoolFlag;

use macros::test_state_case;
use newtypes::{
    BooleanOperator, CollectedDataOption as CDO, DbActor, FootprintReasonCode, KycState, OnboardingStatus,
    RuleAction, RuleExpression, RuleExpressionCondition, StepUpKind, WorkflowState,
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
