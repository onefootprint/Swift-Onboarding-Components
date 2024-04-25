use crate::{
    decision::{
        onboarding::Decision,
        state::{
            actions::WorkflowActions,
            common, kyb,
            test_utils::{
                mock_middesk, mock_webhooks, query_data, query_rule_set_result, ExpectedRequiresManualReview,
                ExpectedStatus, OnboardingCompleted, OnboardingStatusChanged,
            },
            Authorize, BoKycCompleted, MakeDecision, MakeVendorCalls, WorkflowKind, WorkflowWrapper,
        },
        tests::test_helpers,
    },
    errors::ApiResult,
    State,
};
use api_wire_types::TerminalDecisionStatus;
use db::{
    models::{ob_configuration::ObConfiguration, tenant::Tenant, workflow::Workflow as DbWorkflow},
    tests::{fixtures::ob_configuration::ObConfigurationOpts, test_db_pool::TestDbPool, MockFFClient},
};
use feature_flag::BoolFlag;
use itertools::Itertools;
use macros::{test_state, test_state_case};
use newtypes::{
    CollectedDataOption as CDO, DecisionStatus, FootprintReasonCode, KybState, OnboardingStatus, RuleAction,
    SignalSeverity, VendorAPI, WorkflowFixtureResult, WorkflowState,
};

async fn setup(
    state: &State,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (DbWorkflow, Tenant, ObConfiguration, DbWorkflow) {
    let is_live = fixture_result.is_none();
    let cdos = vec![
        CDO::PhoneNumber,
        CDO::FullAddress,
        CDO::BusinessName,
        CDO::BusinessBeneficialOwners,
    ];
    let (t, wf, _v, _sv, obc, biz_wf) = test_helpers::create_kyb_user_and_onboarding(
        state,
        ObConfigurationOpts {
            is_live,
            must_collect_data: cdos.clone(),
            can_access_data: cdos,
            ..Default::default()
        },
        fixture_result,
    )
    .await;

    (biz_wf, t, obc, wf)
}

async fn kyc_bo(state: &mut State, person_wf: &DbWorkflow) {
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

    let wf = person_wf.clone();
    let svid = person_wf.scoped_vault_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            common::save_decision_inner(
                conn,
                &svid,
                &wf,
                vec![],
                Decision {
                    decision_status: DecisionStatus::Pass,
                    should_commit: false,
                    create_manual_review: false,
                    action: None,
                },
                None,
                vec![],
            )
        })
        .await
        .unwrap();
    crate::task::execute_webhook_tasks(state.clone());
}

#[test_state]
async fn authorize(state: &mut State) {
    let (wf, _, _, _) = setup(state, None).await;

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::DataCollection(_))
    ));

    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::AwaitingBoKyc(_))
    ));
}

#[test_state_case(WorkflowFixtureResult::Pass)]
#[test_state_case(WorkflowFixtureResult::Fail)]
#[tokio::test(flavor = "multi_thread")]
async fn sandbox(state: &mut State, fixture_result: WorkflowFixtureResult) {
    // SETUP
    let (wf, _, _, person_wf) = setup(state, Some(fixture_result)).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    // BoKycCompleted
    kyc_bo(state, &person_wf).await;
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pending),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );

    let (ww, _) = ww
        .action(state, WorkflowActions::BoKycCompleted(BoKycCompleted {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::VendorCalls(_))
    ));

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::VendorCalls), wf.state);
    assert_eq!(OnboardingStatus::Pending, wf.status.unwrap());

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();
    // In sandbox, we should go straight to Decisioning (ie skip AwaitingAsyncVendors state becuase we are mocking middesk)
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::Decisioning(_))
    ));

    let (wf, _, _, _, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::Decisioning), wf.state);

    // Appropriate KYB passing risk signals are produced and not hidden
    let expected_severity = match fixture_result {
        WorkflowFixtureResult::Fail => SignalSeverity::High,
        WorkflowFixtureResult::Pass => SignalSeverity::Info,
        WorkflowFixtureResult::ManualReview => todo!(),
        WorkflowFixtureResult::StepUp => todo!(),
        WorkflowFixtureResult::DocumentDecision => panic!("unsupported fixture passed for kyb"),
    };
    assert!(rs.iter().all(|rs| rs.reason_code.severity() == expected_severity
        && !rs.reason_code.scope().unwrap().is_for_person()
        && rs.vendor_api == VendorAPI::MiddeskBusinessUpdateWebhook
        && !rs.hidden));

    // MakeDecision
    let expected_status = match fixture_result {
        WorkflowFixtureResult::Fail => OnboardingStatus::Fail,
        WorkflowFixtureResult::Pass => OnboardingStatus::Pass,
        WorkflowFixtureResult::ManualReview => todo!(),
        WorkflowFixtureResult::StepUp => todo!(),
        WorkflowFixtureResult::DocumentDecision => panic!("unsupported fixture passed for kyb"),
    };
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(expected_status),
            ExpectedRequiresManualReview(false),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_status),
            ExpectedRequiresManualReview(false),
        )],
    );

    let (_ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision {}))
        .await
        .unwrap();

    let (wf, _, mrs, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::Complete), wf.state);

    assert!(mrs.is_empty());
    assert_eq!(expected_status, wf.status.unwrap());
}

#[test_state_case(TerminalDecisionStatus::Pass)]
#[test_state_case(TerminalDecisionStatus::Fail)]
#[tokio::test(flavor = "multi_thread")]
async fn live(state: &mut State, terminal_status: TerminalDecisionStatus) {
    // SETUP
    let (wf, tenant, obc, person_wf) = setup(state, None).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let ww = WorkflowWrapper::init(state, wf).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();
    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::AwaitingBoKyc), wf.state);

    let mut mock_ff_client = MockFFClient::new();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .times(2)
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
            .return_const(false);
    });
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::EnableMiddeskInNonProd(&obc.key))
            .return_once(move |_| true);
    });

    state.set_ff_client(mock_ff_client.into_mock());

    // BoKycCompleted
    kyc_bo(state, &person_wf).await;
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(OnboardingStatus::Pending),
            ExpectedRequiresManualReview(false),
        )],
        vec![],
    );

    let (ww, _) = ww
        .action(state, WorkflowActions::BoKycCompleted(BoKycCompleted {}))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::VendorCalls(_))
    ));

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::VendorCalls), wf.state);
    assert_eq!(OnboardingStatus::Pending, wf.status.unwrap());

    // MakeVendorCalls
    let business_id = "business123yo".to_owned();
    mock_middesk(state, &business_id);

    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls {}))
        .await
        .unwrap();
    // In sandbox, we should go straight to Decisioning (ie skip AwaitingAsyncVendors state becuase we are mocking middesk)
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::AwaitingAsyncVendors(_))
    ));

    let (wf, _, _, _, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::AwaitingAsyncVendors), wf.state);
    assert!(rs.is_empty());

    // Simulate Middesk webhook incoming. Middesk state machine should complete and then call the KYB workflow
    let expected_rule_action = match terminal_status {
        // We simulate a wl hit when terminal status = Fail for these tests
        TerminalDecisionStatus::Fail => Some(RuleAction::ManualReview),
        TerminalDecisionStatus::Pass => None,
    };
    let expected_status = terminal_status.into();
    let expected_manual_review = matches!(terminal_status, TerminalDecisionStatus::Fail);
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(expected_status),
            ExpectedRequiresManualReview(expected_manual_review),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_status),
            ExpectedRequiresManualReview(expected_manual_review),
        )],
    );

    crate::decision::vendor::middesk::handle_middesk_webhook(
        state,
        idv::tests::fixtures::middesk::business_update_webhook(
            &business_id,
            matches!(terminal_status, TerminalDecisionStatus::Fail),
        ),
    )
    .await
    .unwrap();

    let (wf, _, mrs, _, rs) = query_data(state, &svid, &wfid).await;
    let (rule_set_result, _) = query_rule_set_result(state, &wf.scoped_vault_id).await.unwrap();
    assert_eq!(rule_set_result.action_triggered, expected_rule_action);
    assert_eq!(WorkflowState::Kyb(KybState::Complete), wf.state);

    let mut expected_rs = vec![
        (
            VendorAPI::MiddeskBusinessUpdateWebhook,
            FootprintReasonCode::BusinessNameMatch,
        ),
        (
            VendorAPI::MiddeskBusinessUpdateWebhook,
            FootprintReasonCode::BusinessAddressMatch,
        ),
        (
            VendorAPI::MiddeskBusinessUpdateWebhook,
            FootprintReasonCode::TinMatch,
        ),
    ];
    match terminal_status {
        TerminalDecisionStatus::Pass => {
            assert!(mrs.is_empty());
            assert_eq!(OnboardingStatus::Pass, wf.status.unwrap());
        }
        TerminalDecisionStatus::Fail => {
            assert!(!mrs.is_empty());
            assert_eq!(OnboardingStatus::Fail, wf.status.unwrap());
            expected_rs.push((
                VendorAPI::MiddeskBusinessUpdateWebhook,
                FootprintReasonCode::BusinessNameWatchlistHit,
            ));
        }
    }

    assert_eq!(
        expected_rs,
        rs.into_iter()
            .map(|rs| (rs.vendor_api, rs.reason_code))
            .collect_vec()
    );
}
