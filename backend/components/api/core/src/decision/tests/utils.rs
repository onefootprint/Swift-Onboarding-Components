use crate::decision::utils;
use crate::tests::fixtures;
use crate::State;
use db::tests::test_db_pool::TestDbPool;
use db::DbResult;
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use macros::test_state;
use newtypes::{DecisionStatus, OnboardingStatus};
use std::sync::Arc;
use test_case::test_case;

#[test_state]
async fn test_handle_setup(state: &mut State) {
    //
    // PROD
    //
    // create a live UV and ob_config
    let (tenant, vault) = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let (tenant, _, vault, _) =
                fixtures::lib::create_user_and_onboarding(conn, true, OnboardingStatus::Pass, vec![]);
            Ok((tenant, vault))
        })
        .await
        .unwrap();
    assert!(vault.is_live);

    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .times(1)
        .return_once(|_| false);
    state.set_ff_client(Arc::new(mock_ff_client));

    let res =
        utils::get_fixture_data_decision(state.feature_flag_client.clone(), &vault, &tenant.id).unwrap();
    assert!(res.is_none()); // No fixture decision

    //
    // PROD DEMO TENANT
    //

    // create a live UV and ob_config
    // TODO: do we even need to make a new user here?
    let (tenant, vault) = state
        .db_pool
        .db_transaction(move |conn| -> db::DbResult<_> {
            let (tenant, _, vault, _) =
                fixtures::lib::create_user_and_onboarding(conn, true, OnboardingStatus::Pass, vec![]);
            Ok((tenant, vault))
        })
        .await
        .unwrap();
    assert!(vault.is_live);
    // set up ff
    let mut mock_ff_client = MockFeatureFlagClient::new();
    let tenant_id = tenant.id.clone();
    mock_ff_client
        .expect_flag()
        .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
        .times(1)
        .return_once(|_| true);
    state.set_ff_client(Arc::new(mock_ff_client));

    let res =
        utils::get_fixture_data_decision(state.feature_flag_client.clone(), &vault, &tenant.id).unwrap();
    assert!(res == Some((DecisionStatus::Pass, false))); // Fixture decision for demo tenant
}

#[test_case("fail" => (DecisionStatus::Fail, false))]
#[test_case("failininin1234" => (DecisionStatus::Fail, false))]
#[test_case("manualreview" => (DecisionStatus::Fail, true))]
#[test_case("manualreview1234" => (DecisionStatus::Fail, true))]
#[test_case("passmeplease" => (DecisionStatus::Pass, false))]
#[test_case("idv" => (DecisionStatus::Pass, false))]
fn test_decision_status_from_sandbox_suffix(suffix: &str) -> (DecisionStatus, bool) {
    utils::decision_status_from_sandbox_id(suffix)
}
