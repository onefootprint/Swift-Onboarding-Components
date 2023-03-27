use crate::decision::utils;
use crate::tests::fixtures;
use db::tests::prelude::*;
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use macros::db_test;
use newtypes::{DecisionStatus, PhoneNumber};
use test_case::test_case;

#[db_test]
fn test_handle_setup(conn: &mut TestPgConn) {
    let state =
        &tokio_test::block_on(async { crate::utils::mock_enclave::StateWithMockEnclave::init().await }).state;
    //
    // PROD
    //

    // create a live UV and ob_config
    let (_, _, uvw, tenant, _) = fixtures::vault_wrapper::create(conn, true);
    assert!(uvw.vault.is_live);

    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .times(1)
        .return_once(|_| false);

    let res = tokio_test::block_on(async {
        utils::get_fixture_data_decision(state, &mock_ff_client, &uvw, &tenant.id).await
    })
    .unwrap();
    assert!(res.is_none()); // No fixture decision

    //
    // PROD DEMO TENANT
    //

    // create a live UV and ob_config
    let (_, _, uvw, tenant, _) = fixtures::vault_wrapper::create(conn, true);
    assert!(uvw.vault.is_live);
    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .times(1)
        .return_once(|_| true);

    let res = tokio_test::block_on(async {
        utils::get_fixture_data_decision(state, &mock_ff_client, &uvw, &tenant.id).await
    })
    .unwrap();
    assert!(res == Some((DecisionStatus::Pass, false))); // Fixture decision for demo tenant
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
