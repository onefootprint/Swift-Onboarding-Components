use crate::decision::engine;
use crate::decision::rule::RuleSetName;
use crate::State;
use crate::{
    decision::vendor::vendor_trait::MockVendorAPICall,
    utils::{mock_enclave::StateWithMockEnclave, vault_wrapper::VaultWrapper},
};
use db::models::ob_configuration::ObConfiguration;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use db::DbPool;
use db::{
    models::{
        onboarding::Onboarding, onboarding_decision::OnboardingDecision, phone_number::NewPhoneNumberArgs,
        risk_signal::RiskSignal, scoped_vault::ScopedVault, vault::NewVaultInfo,
    },
    test_helpers::test_db_pool,
    tests::fixtures,
    DbError, TxnPgConn,
};
#[cfg(test)]
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use idv::experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse};
use idv::idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest};
use idv::socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest};
use idv::twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request};
use newtypes::Fingerprinter;
use newtypes::{
    DecisionStatus, EncryptedVaultPrivateKey, FootprintReasonCode, IdentityDataKind, PiiString, VaultId,
    VaultPublicKey, Vendor, VendorAPI,
};
use rand::Rng;
use test_case::test_case;

type KeysAndNewPhoneNumberArgs = (VaultPublicKey, EncryptedVaultPrivateKey, NewPhoneNumberArgs);
async fn get_keys_and_new_phone_args(state: &State, phone_number: &String) -> KeysAndNewPhoneNumberArgs {
    let (public_key, e_private_key) = state.enclave_client.generate_sealed_keypair().await.unwrap();
    let sh_data = state
        .compute_fingerprint(IdentityDataKind::PhoneNumber, PiiString::from(phone_number))
        .await
        .unwrap();
    let phone_info = NewPhoneNumberArgs {
        e_phone_number: public_key.seal_pii(&PiiString::from(phone_number)).unwrap(),
        sh_phone_number: sh_data,
    };

    (public_key, e_private_key, phone_info)
}

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

fn create_user_and_populate_vault(
    conn: &mut TxnPgConn,
    ob_config: ObConfiguration,
    keys_and_new_phone_args: KeysAndNewPhoneNumberArgs,
) -> (Vault, ScopedVault) {
    let user_info = NewVaultInfo {
        e_private_key: keys_and_new_phone_args.1,
        public_key: keys_and_new_phone_args.0,
        is_live: true,
    };

    let uv = VaultWrapper::create_user_vault(conn, user_info, ob_config.clone(), keys_and_new_phone_args.2)
        .unwrap();

    let su = fixtures::scoped_vault::create(conn, &uv.id, &ob_config.id);

    let update = vec![
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
    uvw.add_data_test(conn, update).unwrap();

    (uv.into_inner(), su)
}

async fn create_user_and_onboarding(
    state: &State,
    db_pool: &DbPool,
    phone_number: &String,
) -> (Tenant, Onboarding, VaultId) {
    let keys_and_phone = get_keys_and_new_phone_args(state, phone_number).await;

    db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let tenant = fixtures::tenant::create(conn);
            let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);
            let ob_config_id = ob_config.id.clone();

            let (uv, su) = create_user_and_populate_vault(conn, ob_config, keys_and_phone);

            let onboarding = fixtures::onboarding::create(conn, su.id, ob_config_id);

            fixtures::verification_request::bulk_create(
                conn,
                &onboarding.scoped_user_id,
                vec![
                    VendorAPI::TwilioLookupV2,
                    VendorAPI::IdologyExpectID,
                    VendorAPI::SocureIDPlus,
                    VendorAPI::ExperianPreciseID,
                ],
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
    let phone_number = random_phone_number();

    let (tenant, onboarding, uvid) = create_user_and_onboarding(state, &db_pool, &phone_number).await;

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
            assert_eq!(expected_footprint_reason_codes.len(), risk_signals.len());
            assert_eq!(
                expected_footprint_reason_codes,
                risk_signals
                    .iter()
                    .map(|rs| rs.reason_code.clone())
                    .collect::<Vec<_>>()
            );
            assert_eq!(vec![Vendor::Idology], risk_signals[0].vendors);

            db::private_cleanup_integration_tests(conn, &uvid).unwrap();
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
