use crate::decision::utils;
use crate::tests::fixtures;
use db::tests::prelude::*;
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use macros::db_test;
use newtypes::{DecisionStatus, OnboardingId, PhoneNumber};
use std::str::FromStr;
use test_case::test_case;

#[db_test]
fn test_handle_setup(conn: &mut TestPgConn) {
    //
    // SANDBOX
    //
    let state =
        &tokio_test::block_on(async { crate::utils::mock_enclave::StateWithMockEnclave::init().await }).state;

    let onboarding_id = OnboardingId::from_str("ob_123").unwrap();
    let (_, _, uvw, _, _) = fixtures::vault_wrapper::create(conn, false);
    assert!(!uvw.vault.is_live);
    // it doesn't matter what we pass here, just don't want it to be true
    let phone_number = PhoneNumber::parse("+1 123 456 7890#idv".into()).unwrap();

    let res = tokio_test::block_on(async {
        utils::should_initiate_sandbox_and_setup(state, onboarding_id, uvw, phone_number, false).await
    })
    .unwrap();

    assert!(!res);

    //
    // PROD
    //

    // create a live UV and ob_config
    let (su, ob_config, uvw, tenant, _) = fixtures::vault_wrapper::create(conn, true);
    assert!(uvw.vault.is_live);
    // from the things we set up with UVW, create an onboarding
    let ob = db::tests::fixtures::onboarding::create(conn, su.id, ob_config.id);

    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .times(1)
        .return_once(|_| false);

    let res = tokio_test::block_on(async {
        utils::should_initiate_prod_and_setup(state, ob.id, uvw, tenant.id, &mock_ff_client, false).await
    })
    .unwrap();

    assert!(res);

    //
    // PROD DEMO TENANT
    //

    // create a live UV and ob_config
    let (su, ob_config, uvw, tenant, _) = fixtures::vault_wrapper::create(conn, true);
    assert!(uvw.vault.is_live);
    // from the things we set up with UVW, create an onboarding
    let ob = db::tests::fixtures::onboarding::create(conn, su.id, ob_config.id);

    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .times(1)
        .return_once(|_| true);

    let res = tokio_test::block_on(async {
        utils::should_initiate_prod_and_setup(state, ob.id, uvw, tenant.id, &mock_ff_client, false).await
    })
    .unwrap();
    // should not be true
    assert!(!res)
}

#[test_case("fail" => (DecisionStatus::Fail, false))]
#[test_case("failininin1234" => (DecisionStatus::Fail, false))]
#[test_case("manualreview" => (DecisionStatus::Fail, true))]
#[test_case("manualreview1234" => (DecisionStatus::Fail, true))]
#[test_case("passmeplease" => (DecisionStatus::Pass, false))]
#[test_case("idv" => (DecisionStatus::Pass, false))]
fn test_decision_status_from_sandbox_suffix(suffix: &str) -> (DecisionStatus, bool) {
    let phone_number = PhoneNumber::parse(format!("+1 123 456 7890#{}", suffix).into()).unwrap();
    utils::decision_status_from_sandbox_suffix(phone_number)
}
