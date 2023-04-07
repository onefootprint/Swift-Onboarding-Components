use crate::decision::engine;
use crate::decision::rule::RuleSetName;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::{
    decision::vendor::vendor_trait::MockVendorAPICall,
    utils::{mock_enclave::StateWithMockEnclave, vault_wrapper::VaultWrapper},
};
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::DbPool;
use db::{
    models::{
        onboarding::Onboarding, onboarding_decision::OnboardingDecision, risk_signal::RiskSignal,
        scoped_vault::ScopedVault,
    },
    test_helpers::test_db_pool,
    tests::fixtures,
    DbError, TxnPgConn,
};
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use idv::experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse};
use idv::idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest};
use idv::socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest};
use idv::twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request};
use newtypes::{
    DecisionStatus, FootprintReasonCode, IdentityDataKind, PiiString, VaultId, Vendor, VendorAPI,
};
use rand::Rng;
#[cfg(test)]
use test_case::test_case;

fn random_phone_number() -> String {
    let mut rng = rand::thread_rng();

    format!(
        "+1{}",
        (0..10)
            .map(|_| rng.gen_range(0..10).to_string())
            .collect::<Vec<String>>()
            .join("")
    )
}

fn create_user_and_populate_vault(conn: &mut TxnPgConn, ob_config: ObConfiguration) -> (Vault, ScopedVault) {
    let uv = fixtures::vault::create_person(conn, ob_config.is_live);
    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let update = vec![
        (
            IdentityDataKind::PhoneNumber.into(),
            PiiString::new(random_phone_number()),
        ),
        (
            IdentityDataKind::FirstName.into(),
            PiiString::new("Bob".to_owned()),
        ),
        (
            IdentityDataKind::LastName.into(),
            PiiString::new("Boberto".to_owned()),
        ),
    ];

    let uvw = VaultWrapper::lock_for_onboarding(conn, &su.id).unwrap();
    uvw.add_person_data_test(conn, update).unwrap();

    (uv.into_inner(), su)
}

async fn create_user_and_onboarding(db_pool: &DbPool) -> (Tenant, Onboarding, VaultId) {
    db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let tenant = fixtures::tenant::create(conn);
            let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
            let ob_config_id = ob_config.id.clone();

            let (uv, su) = create_user_and_populate_vault(conn, ob_config);

            let onboarding = fixtures::onboarding::create(conn, su.id, ob_config_id);

            let decision_intent =
                DecisionIntent::get_or_create_onboarding_kyc(conn, &onboarding.scoped_vault_id).unwrap();

            fixtures::verification_request::bulk_create(
                conn,
                &onboarding.scoped_vault_id,
                vec![
                    VendorAPI::TwilioLookupV2,
                    VendorAPI::IdologyExpectID,
                    VendorAPI::SocureIDPlus,
                    VendorAPI::ExperianPreciseID,
                ],
                &decision_intent.id,
            );

            Ok((tenant, onboarding, uv.id))
        })
        .await
        .unwrap()
}

//
// A smattering of e2e integration tests for Decision Engine :)
//
#[test_case(
    "result.match".to_string(),
    Some("resultcode.high.risk.email.recently.verified".to_string()),
    SocureEnabled::Yes,
    DecisionStatus::Pass,
    vec![FootprintReasonCode::EmailRecentlyVerified]
)]
#[test_case(
    "result.no.match".to_string(),
    Some("resultcode.high.risk.email.recently.verified".to_string()),
    SocureEnabled::Yes,
    DecisionStatus::Fail,
    vec![FootprintReasonCode::IdNotLocated, FootprintReasonCode::EmailRecentlyVerified]
)]
#[test_case(
    "result.match".to_string(),
    Some("resultcode.input.address.is.po.box".to_string()),
    SocureEnabled::Yes,
    DecisionStatus::Fail,
    vec![FootprintReasonCode::AddressInputIsPoBox]
)]
#[test_case(
    "result.match.restricted".to_string(),
    Some("resultcode.high.risk.email.recently.verified".to_string()),
    SocureEnabled::No,
    DecisionStatus::Pass,
    vec![FootprintReasonCode::EmailRecentlyVerified]
)]
#[tokio::test]
async fn test_run(
    idology_result: String,
    idology_qualifier: Option<String>,
    socure_enabled: SocureEnabled,
    expected_decision_status: DecisionStatus,
    expected_footprint_reason_codes: Vec<FootprintReasonCode>,
) {
    //
    // Setup
    //
    let db_pool = test_db_pool();
    let state = &StateWithMockEnclave::init().await.state;

    let (tenant, onboarding, uvid) = create_user_and_onboarding(&db_pool).await;
    let tenant_vendor_control =
        TenantVendorControl::new_for_test(&state.config, None, &state.enclave_client, &tenant.e_private_key)
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

    mock_ff_client
        .expect_flag()
        .times(1)
        .withf(|f| *f == BoolFlag::EnableRuleSetForDecision(&RuleSetName::IdologyConservativeFailingRules))
        .returning(|_| true);

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

    let onboarding_id = onboarding.id.clone();
    //
    // Function Under Test
    //
    engine::run(
        onboarding,
        &db_pool,
        &state.enclave_client,
        is_production,
        &mock_ff_client,
        &mock_idology_api_call,
        &mock_socure_api_call,
        &mock_twilio_api_call,
        &mock_experian_api_call,
        tenant_vendor_control,
    )
    .await
    .unwrap();

    //
    // Assertions
    //
    db_pool
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

            db::private_cleanup_integration_tests(conn, uvid).unwrap();
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
