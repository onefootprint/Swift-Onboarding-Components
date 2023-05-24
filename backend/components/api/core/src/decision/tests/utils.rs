use crate::decision::utils;
use crate::tests::fixtures;
use crate::State;
use db::tests::test_db_pool::TestDbPool;
use db::DbResult;
use feature_flag::{BoolFlag, MockFeatureFlagClient};
use macros::test_db_pool;
use newtypes::{DecisionStatus, OnboardingStatus, PhoneNumber};
use std::sync::Arc;
use test_case::test_case;

#[test_db_pool]
async fn test_handle_setup(db_pool: TestDbPool) {
    let state = &mut State::test_state().await;
    state.set_db_pool((*db_pool).clone());

    //
    // PROD
    //
    // create a live UV and ob_config
    let (tenant, vault, sv) = state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let (tenant, _, vault, sv) =
                fixtures::lib::create_user_and_onboarding(conn, true, OnboardingStatus::Pass, vec![]);
            Ok((tenant, vault, sv))
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

    let res = utils::get_fixture_data_decision(state, Arc::new(mock_ff_client), &sv.id, &tenant.id)
        .await
        .unwrap();
    assert!(res.is_none()); // No fixture decision

    //
    // PROD DEMO TENANT
    //

    // create a live UV and ob_config
    // TODO: do we even need to make a new user here?
    let (tenant, vault, sv) = state
        .db_pool
        .db_transaction(move |conn| -> db::DbResult<_> {
            let (tenant, _, vault, sv) =
                fixtures::lib::create_user_and_onboarding(conn, true, OnboardingStatus::Pass, vec![]);
            Ok((tenant, vault, sv))
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

    let res = utils::get_fixture_data_decision(state, Arc::new(mock_ff_client), &sv.id, &tenant.id)
        .await
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
