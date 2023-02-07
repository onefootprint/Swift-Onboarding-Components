use crate::decision::utils;
use crate::{feature_flag::MockFeatureFlagClient, tests::fixtures};
use db::tests::prelude::*;
use macros::db_test;
use mockall::predicate::*;
use newtypes::{DecisionStatus, OnboardingId, ValidatedPhoneNumber};
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
    let (_, _, uvw, _, _) = fixtures::user_vault_wrapper::create(conn, false);
    assert!(!uvw.user_vault.is_live);
    // it doesn't matter what we pass here, just don't want it to be true
    let phone_number = ValidatedPhoneNumber::__build("1234".into(), "USA".into(), "idv".into());

    let res = tokio_test::block_on(async {
        utils::should_initiate_sandbox_and_setup(state, onboarding_id, uvw, phone_number, false).await
    })
    .unwrap();

    assert!(!res);

    //
    // PROD
    //

    // create a live UV and ob_config
    let (su, ob_config, uvw, tenant, _) = fixtures::user_vault_wrapper::create(conn, true);
    assert!(uvw.user_vault.is_live);
    // from the things we set up with UVW, create an onboarding
    let ob = db::tests::fixtures::onboarding::create(conn, su.id, ob_config.id);

    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client
        .expect_bool_flag_by_tenant_id()
        .with(eq("IsDemoTenant"), eq(tenant.id.clone()))
        .times(1)
        .return_once(|_, _| Ok(false));

    let res = tokio_test::block_on(async {
        utils::should_initiate_prod_and_setup(state, ob.id, uvw, tenant.id, &mock_ff_client, false).await
    })
    .unwrap();

    assert!(res);

    //
    // PROD DEMO TENANT
    //

    // create a live UV and ob_config
    let (su, ob_config, uvw, tenant, _) = fixtures::user_vault_wrapper::create(conn, true);
    assert!(uvw.user_vault.is_live);
    // from the things we set up with UVW, create an onboarding
    let ob = db::tests::fixtures::onboarding::create(conn, su.id, ob_config.id);

    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    mock_ff_client
        .expect_bool_flag_by_tenant_id()
        .with(eq(utils::IS_DEMO_TENANT_FLAG_NAME), eq(tenant.id.clone()))
        .times(1)
        .return_once(|_, _| Ok(true));

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
#[test_case("pass me please" => (DecisionStatus::Pass, false))]
#[test_case("idv" => (DecisionStatus::Pass, false))]
fn test_decision_status_from_sandbox_suffix(suffix: &str) -> (DecisionStatus, bool) {
    let phone_number = ValidatedPhoneNumber::__build("1234".into(), "USA".into(), suffix.into());
    utils::decision_status_from_sandbox_suffix(phone_number)
}
