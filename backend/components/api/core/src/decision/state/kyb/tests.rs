use crate::decision::state::actions::WorkflowActions;
use crate::decision::state::kyb;
use crate::decision::state::test_utils::get_current_seqno;
use crate::decision::state::test_utils::mock_idology;
use crate::decision::state::test_utils::mock_middesk;
use crate::decision::state::test_utils::mock_webhooks;
use crate::decision::state::test_utils::query_data;
use crate::decision::state::test_utils::query_portablized_seqno;
use crate::decision::state::test_utils::query_risk_signals;
use crate::decision::state::test_utils::query_rule_set_result;
use crate::decision::state::test_utils::ExpectedRequiresManualReview;
use crate::decision::state::test_utils::ExpectedStatus;
use crate::decision::state::test_utils::OnboardingCompleted;
use crate::decision::state::test_utils::OnboardingStatusChanged;
use crate::decision::state::test_utils::UserKind;
use crate::decision::state::test_utils::WithQualifier;
use crate::decision::state::Authorize;
use crate::decision::state::BoKycCompleted;
use crate::decision::state::MakeDecision;
use crate::decision::state::MakeVendorCalls;
use crate::decision::state::WorkflowKind;
use crate::decision::state::WorkflowWrapper;
use crate::decision::tests::test_helpers;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::IncludeRules;
use db::models::rule_instance::RuleInstance;
use db::models::rule_set_result::RuleSetResult;
use db::models::tenant::Tenant;
use db::models::workflow::Workflow as DbWorkflow;
use db::test_helpers::assert_have_same_elements;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::test_db_pool::TestDbPool;
use db::tests::MockFFClient;
use feature_flag::BoolFlag;
use itertools::Itertools;
use macros::test_state;
use macros::test_state_case;
use newtypes::BusinessDataKind;
use newtypes::CollectedDataOption as CDO;
use newtypes::DataIdentifier;
use newtypes::FootprintReasonCode;
use newtypes::KybState;
use newtypes::KycState;
use newtypes::ObConfigurationKind;
use newtypes::OnboardingStatus;
use newtypes::RiskSignalGroupKind;
use newtypes::RuleAction;
use newtypes::RuleInstanceKind;
use newtypes::TerminalDecisionStatus;
use newtypes::VendorAPI;
use newtypes::VerificationCheck;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowState;

async fn setup(
    state: &State,
    fixture_result: Option<WorkflowFixtureResult>,
    ein_only: bool,
) -> (DbWorkflow, Tenant, ObConfiguration, DbWorkflow) {
    let is_live = fixture_result.is_none();
    let cdos: Vec<CDO> = vec![
        Some(CDO::PhoneNumber),
        Some(CDO::FullAddress),
        Some(CDO::BusinessName),
        Some(CDO::BusinessKycedBeneficialOwners),
        (!ein_only).then_some(CDO::BusinessAddress),
        Some(CDO::BusinessTin),
    ]
    .into_iter()
    .flatten()
    .collect();
    let (t, wf, _v, _sv, obc, biz_wf) = test_helpers::create_kyb_user_and_onboarding(
        state,
        ObConfigurationOpts {
            is_live,
            must_collect_data: cdos.clone(),
            can_access_data: cdos,
            kind: ObConfigurationKind::Kyb,
            verification_checks: Some(vec![
                VerificationCheck::Kyb { ein_only: false },
                VerificationCheck::BusinessAml {},
            ]),
            ..Default::default()
        },
        fixture_result,
    )
    .await;

    (biz_wf, t, obc, wf)
}

async fn run_kyc_for_bo(
    state: &mut State,
    wf: &DbWorkflow,
    tenant: Tenant,
    obc: ObConfiguration,
    user_kind: UserKind,
) {
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let obc_id = wf.ob_configuration_id.clone();
    let t_id = tenant.id.clone();
    let is_live = user_kind.is_live();

    state
        .db_query(move |conn| -> FpResult<_> {
            let rule_instance_kinds = RuleInstance::list(conn, &t_id, is_live, &obc_id, IncludeRules::All)
                .unwrap()
                .into_iter()
                .map(|ri| ri.kind)
                .unique()
                .collect();

            // check we have both biz and person rules on this OBC
            assert_have_same_elements(
                rule_instance_kinds,
                vec![RuleInstanceKind::Person, RuleInstanceKind::Business],
            );

            Ok(())
        })
        .await
        .unwrap();

    let expected_ob_status = match user_kind {
        UserKind::Demo => unimplemented!(),
        UserKind::Sandbox(fixture) => match fixture {
            WorkflowFixtureResult::Fail => Some(OnboardingStatus::Fail),
            WorkflowFixtureResult::Pass => Some(OnboardingStatus::Pass),
            WorkflowFixtureResult::ManualReview => unimplemented!(),
            WorkflowFixtureResult::StepUp => unimplemented!(),
            WorkflowFixtureResult::UseRulesOutcome => unimplemented!(),
        },
        // assuming BO passes in live
        UserKind::Live => Some(OnboardingStatus::Pass),
    }
    .unwrap();

    let seqno = get_current_seqno(state).await;
    let ww = WorkflowWrapper::init(state, wf.clone(), seqno).await.unwrap();

    // MOCKING
    let mut mock_ff_client = MockFFClient::new();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .times(3)
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant.id))
            .return_const(matches!(user_kind, UserKind::Demo));
    });

    match user_kind {
        UserKind::Demo | UserKind::Sandbox(_) => {}
        UserKind::Live => {
            let ob_config_key = obc.key.clone();
            mock_ff_client.mock(|c| {
                c.expect_flag()
                    .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                    .return_once(move |_| true);
            });

            mock_idology(state, WithQualifier(None)); // live always passes
        }
    };
    state.set_ff_client(mock_ff_client.into_mock());

    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize { seqno }))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert!(wf.authorized_at.is_some());
    assert_eq!(WorkflowState::Kyc(KycState::VendorCalls), wf.state);

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno }))
        .await
        .unwrap();

    let (wf, _, _, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Decisioning), wf.state);
    let rs = query_risk_signals(state, &svid, RiskSignalGroupKind::Kyc).await;
    assert!(!rs.is_empty());
    assert!(rs.iter().all(|r| !r.hidden));

    // Expect Webhooks
    mock_webhooks(
        state,
        vec![OnboardingStatusChanged(
            ExpectedStatus(expected_ob_status),
            ExpectedRequiresManualReview(false),
        )],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_ob_status),
            ExpectedRequiresManualReview(false),
        )],
    );

    // MakeDecision
    let (_, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision { seqno }))
        .await
        .unwrap();

    let (wf, _, mrs, obd, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    assert_eq!(expected_ob_status, wf.status);
    let portablized_seqno = query_portablized_seqno(state, &svid).await;
    if matches!(expected_ob_status, OnboardingStatus::Pass) {
        let seq = portablized_seqno.unwrap();
        assert_eq!(obd.as_ref().unwrap().seqno.unwrap(), seq);
    } else {
        assert!(portablized_seqno.is_none());
    }
    assert!(obd.unwrap().rule_set_result_id.is_some());
    assert!(mrs.is_empty());

    // Rules Engine was run and a result saved and nothing catastrophic happened
    let _ = state
        .db_query(move |conn| RuleSetResult::latest_workflow_decision(conn, &svid))
        .await
        .unwrap()
        .unwrap();
}

#[test_state]
async fn authorize(state: &mut State) {
    let (wf, _, _, _) = setup(state, None, false).await;

    let seqno = get_current_seqno(state).await;
    let ww = WorkflowWrapper::init(state, wf, seqno).await.unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::DataCollection(_))
    ));

    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize { seqno }))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::StepUpDecisioning(_))
    ));
}

#[test_state_case(WorkflowFixtureResult::Pass, false)]
#[test_state_case(WorkflowFixtureResult::Fail, false)]
#[test_state_case(WorkflowFixtureResult::Pass, true)]
#[test_state_case(WorkflowFixtureResult::Fail, true)]
#[tokio::test(flavor = "multi_thread")]
async fn sandbox(state: &mut State, fixture_result: WorkflowFixtureResult, ein_only: bool) {
    // SETUP
    let (wf, tenant, obc, person_wf) = setup(state, Some(fixture_result), ein_only).await;
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let seqno = get_current_seqno(state).await;
    let ww = WorkflowWrapper::init(state, wf, seqno).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize { seqno }))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::StepUpDecisioning(_))
    ));
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision { seqno }))
        .await
        .unwrap();

    // BoKycCompleted
    run_kyc_for_bo(state, &person_wf, tenant, obc, UserKind::Sandbox(fixture_result)).await;
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
    assert_eq!(OnboardingStatus::Pending, wf.status);

    // MakeVendorCalls
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno }))
        .await
        .unwrap();
    // In sandbox, we should go straight to Decisioning (ie skip AwaitingAsyncVendors state becuase we
    // are mocking middesk)
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::Decisioning(_))
    ));

    let (wf, _, _, _, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::Decisioning), wf.state);

    // Appropriate KYB passing risk signals are produced and not hidden
    assert!(rs
        .iter()
        .all(|rs| !rs.reason_code.scope().unwrap().is_for_person() && !rs.hidden));

    // MakeDecision
    let expected_status = match fixture_result {
        WorkflowFixtureResult::Fail => OnboardingStatus::Fail,
        WorkflowFixtureResult::Pass => OnboardingStatus::Pass,
        WorkflowFixtureResult::ManualReview => todo!(),
        WorkflowFixtureResult::StepUp => todo!(),
        WorkflowFixtureResult::UseRulesOutcome => panic!("unsupported fixture passed for kyb"),
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
        .action(state, WorkflowActions::MakeDecision(MakeDecision { seqno }))
        .await
        .unwrap();

    let (wf, _, mrs, _, _) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::Complete), wf.state);

    assert!(mrs.is_empty());
    assert_eq!(expected_status, wf.status);

    // check that middesk populated formation DIs
    if matches!(
        fixture_result,
        WorkflowFixtureResult::ManualReview | WorkflowFixtureResult::Pass
    ) {
        let vw: VaultWrapper = state
            .db_query(move |conn| VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&wf.scoped_vault_id)))
            .await
            .unwrap();

        let formation_state = vw
            .decrypt_unchecked_single(
                &state.enclave_client,
                DataIdentifier::Business(BusinessDataKind::FormationState),
            )
            .await
            .unwrap()
            .expect("missing formation_state");

        let formation_date = vw
            .decrypt_unchecked_single(
                &state.enclave_client,
                DataIdentifier::Business(BusinessDataKind::FormationDate),
            )
            .await
            .unwrap()
            .expect("missing formation_date");

        assert_eq!(formation_state.leak(), "CA");
        assert_eq!(formation_date.leak(), "2024-02-02");
    }
}

#[test_state_case(TerminalDecisionStatus::Pass, false)]
#[test_state_case(TerminalDecisionStatus::Fail, false)]
#[test_state_case(TerminalDecisionStatus::Pass, true)]
#[test_state_case(TerminalDecisionStatus::Fail, true)]
#[tokio::test(flavor = "multi_thread")]
async fn live(state: &mut State, terminal_status: TerminalDecisionStatus, ein_only: bool) {
    // SETUP
    let (wf, tenant, obc, person_wf) = setup(state, None, ein_only).await;
    let t1 = tenant.clone();
    let obc1 = obc.clone();
    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let seqno = get_current_seqno(state).await;

    let ww = WorkflowWrapper::init(state, wf, seqno).await.unwrap();
    let (ww, _) = ww
        .action(state, WorkflowActions::Authorize(Authorize { seqno }))
        .await
        .unwrap();
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::StepUpDecisioning(_))
    ));
    let (ww, _) = ww
        .action(state, WorkflowActions::MakeDecision(MakeDecision { seqno }))
        .await
        .unwrap();
    run_kyc_for_bo(state, &person_wf, t1, obc1, UserKind::Live).await;

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
    assert_eq!(OnboardingStatus::Pending, wf.status);

    // MakeVendorCalls
    let business_id = "business123yo".to_owned();
    mock_middesk(state, &business_id);

    let (ww, _) = ww
        .action(state, WorkflowActions::MakeVendorCalls(MakeVendorCalls { seqno }))
        .await
        .unwrap();
    // In sandbox, we should go straight to Decisioning (ie skip AwaitingAsyncVendors state becuase we
    // are mocking middesk)
    assert!(matches!(
        ww.state,
        WorkflowKind::Kyb(kyb::KybState::AwaitingAsyncVendors(_))
    ));

    let (wf, _, _, _, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyb(KybState::AwaitingAsyncVendors), wf.state);
    // Only "Possible BO missing RS"
    assert_eq!(rs.len(), 1);

    // Simulate Middesk webhook incoming. Middesk state machine should complete and then call the KYB
    // workflow
    let (expected_rule_action, expected_status) = match terminal_status {
        // We simulate a wl hit when terminal status = Fail for these tests
        TerminalDecisionStatus::Fail => (Some(RuleAction::ManualReview), OnboardingStatus::Fail),
        TerminalDecisionStatus::Pass => (None, OnboardingStatus::Pass),
    };
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
            VendorAPI::Footprint,
            FootprintReasonCode::BeneficialOwnerPossibleMissingBo,
        ),
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
            assert_eq!(OnboardingStatus::Pass, wf.status);
        }
        TerminalDecisionStatus::Fail => {
            assert!(!mrs.is_empty());
            assert_eq!(OnboardingStatus::Fail, wf.status);
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

    // check that middesk populated formation DIs
    let vw = state
        .db_query(move |conn| VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&wf.scoped_vault_id)))
        .await
        .unwrap();

    let formation_state = vw
        .decrypt_unchecked_single(
            &state.enclave_client,
            DataIdentifier::Business(BusinessDataKind::FormationState),
        )
        .await
        .unwrap()
        .expect("missing formation_state");

    let formation_date = vw
        .decrypt_unchecked_single(
            &state.enclave_client,
            DataIdentifier::Business(BusinessDataKind::FormationDate),
        )
        .await
        .unwrap()
        .expect("missing formation_date");

    assert_eq!(formation_state.leak(), "NY");
    assert_eq!(formation_date.leak(), "2022-02-02");
}
