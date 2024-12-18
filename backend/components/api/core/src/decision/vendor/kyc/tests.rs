use super::waterfall;
use crate::decision::state::test_utils::WithScore;
use crate::decision::state::test_utils::WithSsnResultCode;
use crate::decision::state::test_utils::{
    self,
};
use crate::decision::vendor::vendor_result::VendorResult;
use crate::FpResult;
use crate::State;
use db::models::decision_intent::DecisionIntent;
use db::models::tenant_vendor::TenantVendorControl as DbTenantVendorControl;
use db::models::tenant_vendor::UpdateTenantVendorControlArgs;
use db::models::verification_result::VerificationResult;
use db::models::waterfall_execution::WaterfallExecution;
use db::models::waterfall_step::WaterfallStep;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::MockFFClient;
use idv::ParsedResponse;
use macros::test_state_case;
use newtypes::DecisionIntentId;
use newtypes::DecisionIntentKind;
use newtypes::Vendor;
use newtypes::VendorAPI;
use newtypes::WaterfallExecutionId;
use newtypes::WaterfallStepAction;

struct ExperianEnabled(bool);
struct IdologyEnabled(bool);

#[derive(Clone, Debug)]
enum VR {
    ShouldntCall,
    Success(Qualifiers),
    Error,
    HardError,
}
#[derive(Clone, Debug)]
enum Qualifiers {
    None,
    SsnDoesNotMatch,
    IdFlagged,
}
#[derive(Clone, Debug)]
struct ExperianResponse(VR);
#[derive(Clone, Debug)]
struct IdologyResponse(VR);

#[derive(Clone, Debug)]
enum ExpectedResult {
    SingularSuccessVendorResult(Vendor),
    ErrVendorRequestsFailed,
    ErrNotEnoughInformation,
}

struct Run(ExperianResponse, IdologyResponse, ExpectedResult);

#[test_state_case(
    ExperianEnabled(false),
    IdologyEnabled(false),
    Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrNotEnoughInformation),
    Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrNotEnoughInformation)
    ; "No available vendor"
)]
#[test_state_case(
    ExperianEnabled(false),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::Success(Qualifiers::None)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology)),
    Run(ExperianResponse(VR::ShouldntCall),IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
    ; "Idology only, call succeeds"
)]
#[test_state_case(
    ExperianEnabled(false),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed)
    ; "Idology only, call errors, re-run errors"
)]
#[test_state_case(
    ExperianEnabled(false),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::Success(Qualifiers::None)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
    ; "Idology only, call errors, re-rerun succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(false),
    Run(ExperianResponse(VR::Success(Qualifiers::None)), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Experian only, call succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(false),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrVendorRequestsFailed)
    ; "Experian only, call errors, re-run errors"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(false),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::ShouldntCall), ExpectedResult::ErrVendorRequestsFailed) ,
    Run(ExperianResponse(VR::Success(Qualifiers::None)), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Experian only, call errors, re-run succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Success(Qualifiers::None)), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Both, Experian succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::Success(Qualifiers::None)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
    ; "Both, Experian errors, Idology succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::Success(Qualifiers::None)), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Both, Experian errors, Idology errors, re-run Experian succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::HardError), IdologyResponse(VR::HardError), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::Success(Qualifiers::None)), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Both, Experian hard errors, Idology hard errors, re-run Experian succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::Success(Qualifiers::None)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
    ; "Both, Experian errors, Idology errors, re-run Experian errors Idology succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::HardError), IdologyResponse(VR::HardError), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::HardError), IdologyResponse(VR::Success(Qualifiers::None)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
    ; "Both, Experian hard errors, Idology hard errors, re-run Experian hard errors Idology succeeds"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::Error), ExpectedResult::ErrVendorRequestsFailed)
    ; "Both, Experian errors, Idology errors, re-run Experian errors Idology errors"
)]
// Rule failure handling
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), IdologyResponse(VR::Success(Qualifiers::None)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
    ; "Both vendors, Experian fails rules, Idology passes rules"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), IdologyResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Both vendors, Experian fails rules, Idology fails rules"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), IdologyResponse(VR::Error), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Both vendors, Experian fails rules, Idology errors"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Error), IdologyResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
    ; "Both vendors, Experian errors, Idology fails rules"
)]
#[test_state_case(
    ExperianEnabled(true),
    IdologyEnabled(true),
    Run(ExperianResponse(VR::Success(Qualifiers::IdFlagged)), IdologyResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian)),
    Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Experian))
    ; "Both vendors, Experian id flagged, Idology fails ssn match"
)]
// TODO: rule failures + error handling? :o , maybe 3 runs??
#[tokio::test]
async fn test_run_kyc_waterfall(
    state: &mut State,
    experian_enabled: ExperianEnabled,
    idology_enabled: IdologyEnabled,
    run1: Run,
    run2: Run,
) {
    // Setup
    let (wf, t, _playbook, _obc, _tu) = test_utils::setup_data(
        state,
        ObConfigurationOpts {
            is_live: true,
            ..Default::default()
        },
        None,
    )
    .await;

    let sv_id = wf.scoped_vault_id.clone();
    let di = state
        .db_transaction(move |conn| {
            let args = UpdateTenantVendorControlArgs {
                idology_enabled: Some(idology_enabled.0),
                experian_enabled: Some(experian_enabled.0),
                experian_subscriber_code: Some(experian_enabled.0.then_some("abc123".to_owned())),
                ..Default::default()
            };
            DbTenantVendorControl::update_or_create(conn, &t.id, args).unwrap();

            Ok(DecisionIntent::create(conn, DecisionIntentKind::OnboardingKyc, &sv_id, None).unwrap())
        })
        .await
        .unwrap();

    // Mock Run 1

    let Run {
        0: experian_response,
        1: idology_response,
        2: expected_result,
    } = run1;
    mock_calls(state, experian_response.clone(), idology_response.clone());
    // Function under test
    let res = waterfall::run_kyc_waterfall(state, &di, &wf).await;
    // Assertions
    assert_expected_result_with_wfe(
        state,
        expected_result,
        experian_response,
        idology_response,
        &di.id,
        1,
        res,
    )
    .await;

    // Simulate re-running. Ones that suceeded already should noop. Ones that ended in error should
    // remake vendor calls Mock Run 2
    let Run {
        0: experian_response2,
        1: idology_response2,
        2: expected_result2,
    } = run2;
    mock_calls(state, experian_response2.clone(), idology_response2.clone());
    // Function under test
    let res2 = waterfall::run_kyc_waterfall(state, &di, &wf).await;
    // Assertions
    assert_expected_result_with_wfe(
        state,
        expected_result2,
        experian_response2,
        idology_response2,
        &di.id,
        2,
        res2,
    )
    .await;
}

fn mock_calls(state: &mut State, experian_response: ExperianResponse, idology_response: IdologyResponse) {
    // TODO: maybe by default the state's mock_ff_client could respond to any flag and return their
    // default value (since thats something we specify in enum). Oof but then we gotta solve the whole
    // is_production dealiooo
    let mut mock_ff_client = MockFFClient::new();
    mock_ff_client.mock(|c| {
        c.expect_flag().return_const(true);
    });
    match idology_response.0 {
        VR::ShouldntCall => (),
        VR::Success(qualifiers) => match qualifiers {
            Qualifiers::None => test_utils::mock_idology(state, test_utils::WithQualifier(None)),
            Qualifiers::SsnDoesNotMatch => test_utils::mock_idology(
                state,
                test_utils::WithQualifier(Some("resultcode.ssn.does.not.match".to_owned())),
            ),
            Qualifiers::IdFlagged => unimplemented!(), /* TODO: we don't generate this FRC for idology, but
                                                        * we could use thin file here */
        },
        VR::Error => test_utils::mock_idology_parseable_error(state),
        VR::HardError => test_utils::mock_idology_hard_error(state),
    };
    match experian_response.0 {
        VR::ShouldntCall => (),
        VR::Success(qualifiers) => match qualifiers {
            Qualifiers::None => {
                test_utils::mock_experian(state, WithSsnResultCode(None), WithScore(Some("800")))
            }
            Qualifiers::SsnDoesNotMatch => {
                test_utils::mock_experian(state, WithSsnResultCode(Some("CY")), WithScore(Some("800")))
            }
            Qualifiers::IdFlagged => {
                test_utils::mock_experian(state, WithSsnResultCode(None), WithScore(Some("400")))
            }
        },

        VR::Error => test_utils::mock_experian_parseable_error(state),
        VR::HardError => test_utils::mock_experian_hard_error(state),
    };
    state.set_ff_client(mock_ff_client.into_mock());
}

async fn assert_expected_result(
    state: &mut State,
    expected_result: ExpectedResult,
    res: FpResult<VendorResult>,
) {
    match expected_result {
        ExpectedResult::SingularSuccessVendorResult(vendor) => {
            assert_vendor_result(state, vendor, res.unwrap()).await;
        }
        ExpectedResult::ErrVendorRequestsFailed => {
            let err = res.err().unwrap();
            assert_eq!(err.message(), "One or more vendor requests failed");
            // TODO: could also assert that vreq/vres with is_error = true was written
        }
        ExpectedResult::ErrNotEnoughInformation => {
            let err = res.err().unwrap().message();
            assert_eq!(err, "Not enough information to send to any vendors",);
        }
    };
}

async fn assert_expected_result_with_wfe(
    state: &mut State,
    expected_result: ExpectedResult,
    experian_response: ExperianResponse,
    idology_response: IdologyResponse,
    di_id: &DecisionIntentId,
    run_number: usize,
    res: FpResult<VendorResult>,
) {
    assert_waterfall_execution(
        state,
        expected_result.clone(),
        experian_response,
        idology_response,
        di_id,
        run_number,
    )
    .await;
    assert_expected_result(state, expected_result, res).await;
}

async fn assert_vendor_result(state: &mut State, expected_vendor: Vendor, vr: VendorResult) {
    let vresid = vr.verification_result_id.clone();
    let (vreq, vres) = state
        .db_query(move |conn| VerificationResult::get(conn, &vresid))
        .await
        .unwrap();

    assert_eq!(expected_vendor, vreq.vendor);
    assert!(!vres.is_error);

    match expected_vendor {
        Vendor::Idology => assert!(matches!(vr.response, ParsedResponse::IDologyExpectID(_))),
        Vendor::Experian => assert!(matches!(vr.response, ParsedResponse::ExperianPreciseID(_))),
        _ => panic!(),
    };
}

async fn assert_waterfall_execution(
    state: &mut State,
    expected_result: ExpectedResult,
    experian_response: ExperianResponse,
    idology_response: IdologyResponse,
    di_id: &DecisionIntentId,
    run_number: usize,
) {
    match expected_result {
        ExpectedResult::SingularSuccessVendorResult(_) | ExpectedResult::ErrVendorRequestsFailed => {
            let diid = di_id.clone();
            let wfes = state
                .db_query(move |conn| WaterfallExecution::list(conn, &diid))
                .await
                .unwrap();
            assert_eq!(wfes.len(), run_number);
            // get the latest WFE
            let wfe = wfes.last().unwrap();
            assert!(wfe.completed_at.is_some());

            assert_waterfall_execution_steps(state, experian_response, idology_response, wfe.id.clone()).await
        }
        ExpectedResult::ErrNotEnoughInformation => {
            let diid = di_id.clone();
            let wfes = state
                .db_query(move |conn| WaterfallExecution::list(conn, &diid))
                .await
                .unwrap();
            assert!(wfes.is_empty());
        }
    }
}

async fn assert_waterfall_execution_steps(
    state: &mut State,
    experian_response: ExperianResponse,
    idology_response: IdologyResponse,
    wfe_id: WaterfallExecutionId,
) {
    let mut wfs = state
        .db_query(move |conn| WaterfallStep::list(conn, &wfe_id))
        .await
        .unwrap();
    match (experian_response.0, idology_response.0) {
        (VR::Success(q1), VR::Success(q2)) => {
            assert_eq!(wfs.len(), 2);
            let experian_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::ExperianPreciseId))
                .unwrap();
            let ido_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::IdologyExpectId))
                .unwrap();
            assert!(experian_step.verification_result_id.is_some());
            assert!(!experian_step.verification_result_is_error.unwrap());
            assert!(ido_step.verification_result_id.is_some());
            assert!(!ido_step.verification_result_is_error.unwrap());
            let expected_action_exp = match q1 {
                Qualifiers::None => WaterfallStepAction::Pass,
                Qualifiers::SsnDoesNotMatch => WaterfallStepAction::RuleTriggered,
                Qualifiers::IdFlagged => WaterfallStepAction::IdFlagged,
            };
            let expected_action_ido = match q2 {
                Qualifiers::None => WaterfallStepAction::Pass,
                Qualifiers::SsnDoesNotMatch => WaterfallStepAction::RuleTriggered,
                Qualifiers::IdFlagged => WaterfallStepAction::IdFlagged,
            };

            assert_eq!(experian_step.action.unwrap(), expected_action_exp);
            assert_eq!(ido_step.action.unwrap(), expected_action_ido);
        }
        (VR::ShouldntCall, VR::ShouldntCall) => {
            assert_eq!(wfs.len(), 0);
        }
        (VR::ShouldntCall, VR::Success(_)) => {
            assert_eq!(wfs.len(), 1);
            let step = wfs.pop().unwrap();
            assert_eq!(step.vendor_api, VendorAPI::IdologyExpectId);
            assert!(step.verification_result_id.is_some());
            assert!(!step.verification_result_is_error.unwrap());
            assert_eq!(step.action.unwrap(), WaterfallStepAction::Pass);
        }
        (VR::ShouldntCall, VR::Error) => {
            assert_eq!(wfs.len(), 1);
            let step = wfs.pop().unwrap();
            assert_eq!(step.vendor_api, VendorAPI::IdologyExpectId);
            assert!(step.verification_result_id.is_some());
            assert!(step.verification_result_is_error.unwrap());
            assert_eq!(step.action.unwrap(), WaterfallStepAction::VendorError);
        }
        (VR::Success(_), VR::ShouldntCall) => {
            assert_eq!(wfs.len(), 1);
            let step = wfs.pop().unwrap();
            assert_eq!(step.vendor_api, VendorAPI::ExperianPreciseId);
            assert!(step.verification_result_id.is_some());
            assert!(!step.verification_result_is_error.unwrap());
            assert_eq!(step.action.unwrap(), WaterfallStepAction::Pass)
        }
        (VR::Success(q), VR::Error) => {
            assert_eq!(wfs.len(), 2);
            let experian_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::ExperianPreciseId))
                .unwrap();
            let ido_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::IdologyExpectId))
                .unwrap();
            assert!(experian_step.verification_result_id.is_some());
            assert!(!experian_step.verification_result_is_error.unwrap());
            assert!(ido_step.verification_result_id.is_some());
            assert!(ido_step.verification_result_is_error.unwrap());
            assert_eq!(ido_step.action.unwrap(), WaterfallStepAction::VendorError);

            let exp_action = experian_step.action.unwrap();
            let expected_action = match q {
                Qualifiers::None => WaterfallStepAction::Pass,
                Qualifiers::SsnDoesNotMatch => WaterfallStepAction::RuleTriggered,
                Qualifiers::IdFlagged => WaterfallStepAction::IdFlagged,
            };

            assert_eq!(exp_action, expected_action);
        }
        (VR::Success(_), VR::HardError) => {
            assert_eq!(wfs.len(), 2);
            let experian_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::ExperianPreciseId))
                .unwrap();
            let ido_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::IdologyExpectId))
                .unwrap();
            assert!(experian_step.verification_result_id.is_some());
            assert!(!experian_step.verification_result_is_error.unwrap());
            assert!(ido_step.verification_result_id.is_some());
            assert!(ido_step.verification_result_is_error.unwrap());
        }
        (VR::Error, VR::Success(q)) => {
            assert_eq!(wfs.len(), 2);
            let experian_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::ExperianPreciseId))
                .unwrap();
            let ido_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::IdologyExpectId))
                .unwrap();
            assert!(ido_step.verification_result_id.is_some());
            assert!(!ido_step.verification_result_is_error.unwrap());
            assert!(experian_step.verification_result_id.is_some());
            assert!(experian_step.verification_result_is_error.unwrap());
            assert_eq!(experian_step.action.unwrap(), WaterfallStepAction::VendorError);

            let ido_action = ido_step.action.unwrap();
            let expected_action = match q {
                Qualifiers::None => WaterfallStepAction::Pass,
                Qualifiers::SsnDoesNotMatch => WaterfallStepAction::RuleTriggered,
                Qualifiers::IdFlagged => WaterfallStepAction::IdFlagged,
            };

            assert_eq!(ido_action, expected_action);
        }
        (VR::HardError, VR::Success(_)) => {
            assert_eq!(wfs.len(), 2);
            let experian_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::ExperianPreciseId))
                .unwrap();
            let ido_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::IdologyExpectId))
                .unwrap();
            assert!(ido_step.verification_result_id.is_some());
            assert!(!ido_step.verification_result_is_error.unwrap());
            assert!(experian_step.verification_result_id.is_some());
            assert!(experian_step.verification_result_is_error.unwrap());
        }
        (VR::HardError, VR::HardError) => {
            assert_eq!(wfs.len(), 2);
            let experian_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::ExperianPreciseId))
                .unwrap();
            let ido_step = wfs
                .iter()
                .find(|ws| matches!(ws.vendor_api, VendorAPI::IdologyExpectId))
                .unwrap();
            assert!(ido_step.verification_result_id.is_some());
            assert!(ido_step.verification_result_is_error.unwrap());
            assert!(experian_step.verification_result_id.is_some());
            assert!(experian_step.verification_result_is_error.unwrap());
        }
        (VR::Error, VR::ShouldntCall) => {
            assert_eq!(wfs.len(), 1);
            let step = wfs.pop().unwrap();
            assert_eq!(step.vendor_api, VendorAPI::ExperianPreciseId);
            assert!(step.verification_result_id.is_some());
            assert!(step.verification_result_is_error.unwrap());
            assert_eq!(step.action.unwrap(), WaterfallStepAction::VendorError);
        }
        (VR::Error, VR::Error) => {
            assert_eq!(wfs.len(), 2);
            assert!(wfs.iter().all(|s| s.verification_result_is_error.unwrap()));
            assert!(wfs
                .iter()
                .all(|s| matches!(s.action.unwrap(), WaterfallStepAction::VendorError)));
        }
        (a, a2) => {
            println!("{:?}", a);
            println!("{:?}", a2);
            unimplemented!()
        }
    }
}
