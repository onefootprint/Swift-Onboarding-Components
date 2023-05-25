use std::sync::Arc;

use super::test_helpers::create_user_and_onboarding;
use crate::decision::engine;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::State;
use db::{
    models::{onboarding_decision::OnboardingDecision, risk_signal::RiskSignal},
    DbError,
};
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use idv::experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse};
use idv::idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest};
use idv::socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest};
use idv::twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request};
use macros::test_state_case;
use newtypes::{DecisionStatus, FootprintReasonCode, Vendor};

//
// A smattering of e2e integration tests for Decision Engine :)
//
#[test_state_case(
    "result.match".to_string(),
    Some("resultcode.high.risk.email.recently.verified".to_string()),
    SocureEnabled::Yes,
    DecisionStatus::Pass,
    vec![FootprintReasonCode::EmailRecentlyVerified]
)]
#[test_state_case(
    "result.no.match".to_string(),
    Some("resultcode.high.risk.email.recently.verified".to_string()),
    SocureEnabled::Yes,
    DecisionStatus::Fail,
    vec![FootprintReasonCode::IdNotLocated, FootprintReasonCode::EmailRecentlyVerified]
)]
#[test_state_case(
    "result.match".to_string(),
    Some("resultcode.input.address.is.po.box".to_string()),
    SocureEnabled::Yes,
    DecisionStatus::Fail,
    vec![FootprintReasonCode::AddressInputIsPoBox]
)]
#[test_state_case(
    "result.match.restricted".to_string(),
    Some("resultcode.high.risk.email.recently.verified".to_string()),
    SocureEnabled::No,
    DecisionStatus::Pass,
    vec![FootprintReasonCode::EmailRecentlyVerified]
)]
#[tokio::test]
async fn test_run(
    state: &mut State,
    idology_result: String,
    idology_qualifier: Option<String>,
    socure_enabled: SocureEnabled,
    expected_decision_status: DecisionStatus,
    expected_footprint_reason_codes: Vec<FootprintReasonCode>,
) {
    //
    // Setup
    //
    let (tenant, onboarding, _, _, _) =
        create_user_and_onboarding(&state.db_pool, &state.enclave_client, None).await;
    let tenant_vendor_control = TenantVendorControl::new(
        tenant.id.clone(),
        &state.db_pool,
        &state.enclave_client,
        &state.config,
    )
    .await
    .unwrap();

    //
    // Mocking
    //
    let is_production = true;
    let mut mock_ff_client = MockFeatureFlagClient::new();
    let mut mock_idology_api_call = MockVendorAPICall::<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >::new();
    let mut mock_socure_api_call =
        MockVendorAPICall::<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>::new();

    let mut mock_twilio_api_call =
        MockVendorAPICall::<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>::new();
    let mut mock_experian_api_call = MockVendorAPICall::<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >::new();

    mock_ff_client
        .expect_flag()
        .times(1)
        .withf(move |f| *f == BoolFlag::CanViewSocureRiskSignals(&tenant.id))
        .return_once(|_| false);

    mock_twilio_api_call
        .expect_make_request()
        .times(1)
        .return_once(|_| Ok(idv::tests::fixtures::twilio::create_response()));

    mock_idology_api_call
        .expect_make_request()
        .times(1)
        .return_once(move |_| {
            Ok(idv::tests::fixtures::idology::create_response(
                idology_result,
                idology_qualifier,
            ))
        });

    mock_experian_api_call
        .expect_make_request()
        .times(1)
        .return_once(move |_| Ok(idv::tests::fixtures::experian::create_response()));

    mock_ff_client
        .expect_flag()
        .times(1)
        .withf(|f| *f == BoolFlag::DisableAllSocure)
        .return_once(move |_| matches!(socure_enabled, SocureEnabled::No));

    if matches!(socure_enabled, SocureEnabled::Yes) {
        mock_socure_api_call
            .expect_make_request()
            .times(1)
            .return_once(|_| Ok(idv::tests::fixtures::socure::create_response()));
    }

    let mock_ff_client = Arc::new(mock_ff_client);
    let mock_idology_api_call = Arc::new(mock_idology_api_call);
    let mock_socure_api_call = Arc::new(mock_socure_api_call);
    let mock_twilio_api_call = Arc::new(mock_twilio_api_call);
    let mock_experian_api_call = Arc::new(mock_experian_api_call);

    state.set_ff_client(mock_ff_client.clone());
    state.set_idology_expect_id(mock_idology_api_call.clone());
    state.set_socure_id_plus(mock_socure_api_call.clone());
    state.set_twilio_lookup_v2(mock_twilio_api_call.clone());
    state.set_experian_cross_core(mock_experian_api_call.clone());

    //
    // Function Under Test
    //
    let onboarding_id = onboarding.id.clone();

    engine::run(
        onboarding,
        &state.db_pool,
        &state.enclave_client,
        is_production,
        mock_ff_client,
        mock_idology_api_call,
        mock_socure_api_call,
        mock_twilio_api_call,
        mock_experian_api_call,
        tenant_vendor_control,
    )
    .await
    .unwrap();

    //
    // Assertions
    //
    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), DbError> {
            let onboarding_decisions = OnboardingDecision::list_by_onboarding_id(conn, &onboarding_id)
                .expect("OnboardingDecision should be created");

            assert_eq!(1, onboarding_decisions.len());
            assert_eq!(expected_decision_status, onboarding_decisions[0].status);

            let risk_signals = RiskSignal::list_by_onboarding_decision_id(conn, &onboarding_decisions[0].id)
                .expect("RiskSignal should be created");
            let rs_reason_codes = risk_signals
                .iter()
                .map(|rs| rs.reason_code.clone())
                .collect::<Vec<_>>();
            assert!(expected_footprint_reason_codes
                .iter()
                .all(|r| rs_reason_codes.contains(r)));
            assert_eq!(vec![Vendor::Idology], risk_signals[0].vendors);

            Ok(())
        })
        .await
        .unwrap();
}

#[derive(Debug, Copy, Clone)]
enum SocureEnabled {
    Yes,
    No,
}
