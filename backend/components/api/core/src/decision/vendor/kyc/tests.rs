use super::waterfall::*;
use crate::{
    decision::{
        state::test_utils::{self, WithSsnResultCode},
        vendor::vendor_result::VendorResult,
    },
    errors::ApiResult,
    ApiErrorKind, State,
};
use db::{
    models::{
        decision_intent::DecisionIntent, tenant_vendor::TenantVendorControl as DbTenantVendorControl,
        verification_result::VerificationResult,
    },
    tests::{fixtures::ob_configuration::ObConfigurationOpts, MockFFClient},
};
use idv::ParsedResponse;
use macros::test_state_case;
use newtypes::{DecisionIntentKind, Vendor};

struct ExperianEnabled(bool);
struct IdologyEnabled(bool);

enum VR {
    ShouldntCall,
    Success(Qualifiers),
    Error,
    HardError,
}
enum Qualifiers {
    None,
    SsnDoesNotMatch,
}
struct ExperianResponse(VR);
struct IdologyResponse(VR);

enum ExpectedResult {
    SingularSuccessVendorResult(Vendor),
    ErrVendorRequestsFailed,
    ErrNotEnoughInformation,
}

struct Run(ExperianResponse, IdologyResponse, ExpectedResult);

// Vendor Error Handling
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
        Run(ExperianResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), IdologyResponse(VR::Success(Qualifiers::SsnDoesNotMatch)), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology)),
        Run(ExperianResponse(VR::ShouldntCall), IdologyResponse(VR::ShouldntCall), ExpectedResult::SingularSuccessVendorResult(Vendor::Idology))
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
    let (wf, t, _obc, _tu) = test_utils::setup_data(
        state,
        ObConfigurationOpts {
            is_live: true,
            ..Default::default()
        },
        None,
    )
    .await;

    let di = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let _tvc: DbTenantVendorControl = DbTenantVendorControl::create(
                conn,
                t.id,
                idology_enabled.0,
                experian_enabled.0,
                false,
                experian_enabled.0.then(|| "abc123".to_owned()),
                None,
            )
            .unwrap();

            Ok(
                DecisionIntent::create(conn, DecisionIntentKind::OnboardingKyc, &wf.scoped_vault_id, None)
                    .unwrap(),
            )
        })
        .await
        .unwrap();

    // Mock Run 1

    let Run {
        0: experian_response,
        1: idology_response,
        2: expected_result,
    } = run1;
    mock_calls(state, experian_response, idology_response);
    // Function under test
    let res = run_kyc_waterfall(state, &di, &wf.id).await;
    // Assertions
    assert_expected_result(state, expected_result, res).await;

    // Simulate re-running. Ones that suceeded already should noop. Ones that ended in error should remake vendor calls
    // Mock Run 2
    let Run {
        0: experian_response2,
        1: idology_response2,
        2: expected_result2,
    } = run2;
    mock_calls(state, experian_response2, idology_response2);
    // Function under test
    let res2 = run_kyc_waterfall(state, &di, &wf.id).await;
    // Assertions
    assert_expected_result(state, expected_result2, res2).await;
}

fn mock_calls(state: &mut State, experian_response: ExperianResponse, idology_response: IdologyResponse) {
    // TODO: maybe by default the state's mock_ff_client could respond to any flag and return their default value (since thats something we specify in enum). Oof but then we gotta solve the whole is_production dealiooo
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
        },
        VR::Error => test_utils::mock_idology_parseable_error(state),
        VR::HardError => test_utils::mock_idology_hard_error(state),
    };
    match experian_response.0 {
        VR::ShouldntCall => (),
        VR::Success(qualifiers) => match qualifiers {
            Qualifiers::None => test_utils::mock_experian(state, WithSsnResultCode(None)),
            Qualifiers::SsnDoesNotMatch => test_utils::mock_experian(state, WithSsnResultCode(Some("CY"))),
        },
        VR::Error => test_utils::mock_experian_parseable_error(state),
        VR::HardError => test_utils::mock_experian_hard_error(state),
    };
    state.set_ff_client(mock_ff_client.into_mock());
}

async fn assert_expected_result(
    state: &mut State,
    expected_result: ExpectedResult,
    res: ApiResult<VendorResult>,
) {
    match expected_result {
        ExpectedResult::SingularSuccessVendorResult(vendor) => {
            assert_vendor_result(state, vendor, res.unwrap()).await;
        }
        ExpectedResult::ErrVendorRequestsFailed => {
            let err = res.err().unwrap();
            if !matches!(err.kind(), ApiErrorKind::VendorRequestsFailed) {
                panic!("{:#?}", err);
            }
            // TODO: could also assert that vreq/vres with is_error = true was written
        }
        ExpectedResult::ErrNotEnoughInformation => {
            let err = res.err().unwrap();
            if let ApiErrorKind::AssertionError(s) = err.kind() {
                assert_eq!(
                    "Not enough information to send to any vendors".to_owned(),
                    s.to_owned()
                );
            } else {
                panic!("{:#?}", err);
            }
        }
    };
}

async fn assert_vendor_result(state: &mut State, expected_vendor: Vendor, vr: VendorResult) {
    let vresid = vr.verification_result_id.clone();
    let (vreq, vres) = state
        .db_pool
        .db_query(move |conn| VerificationResult::get(conn, &vresid))
        .await
        .unwrap();

    assert_eq!(expected_vendor, vreq.vendor);
    assert!(!vres.is_error);

    match expected_vendor {
        Vendor::Idology => assert!(matches!(vr.response.response, ParsedResponse::IDologyExpectID(_))),
        Vendor::Experian => assert!(matches!(
            vr.response.response,
            ParsedResponse::ExperianPreciseID(_)
        )),
        _ => panic!(),
    };
}
