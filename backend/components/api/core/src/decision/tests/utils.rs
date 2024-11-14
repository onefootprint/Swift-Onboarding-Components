use crate::decision::utils;
use crate::tests::fixtures;
use crate::State;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::test_db_pool::TestDbPool;
use feature_flag::BoolFlag;
use macros::test_state;
use newtypes::OnboardingStatus;
use newtypes::WorkflowFixtureResult;

#[test_state]
async fn test_handle_setup(state: &mut State) {
    //
    // PROD
    //
    // create a live UV and ob_config
    let (tenant, vault, wf) = state
        .db_transaction(move |conn| {
            let (tenant, vault, _, wf) = fixtures::lib::create_user_and_onboarding(
                conn,
                ObConfigurationOpts {
                    is_live: true,
                    ..Default::default()
                },
                OnboardingStatus::Pass,
                vec![],
            );
            Ok((tenant, vault, wf))
        })
        .await
        .unwrap();
    assert!(vault.is_live);

    let res = utils::get_fixture_result(state.ff_client.clone(), &vault, &wf, &tenant.id).unwrap();
    assert!(res.is_none()); // No fixture decision

    //
    // PROD DEMO TENANT
    //

    // create a live UV and ob_config
    // TODO: do we even need to make a new user here?
    let (tenant, vault, wf) = state
        .db_transaction(move |conn| {
            let (tenant, vault, _, wf) = fixtures::lib::create_user_and_onboarding(
                conn,
                ObConfigurationOpts {
                    is_live: true,
                    ..Default::default()
                },
                OnboardingStatus::Pass,
                vec![],
            );
            Ok((tenant, vault, wf))
        })
        .await
        .unwrap();
    assert!(vault.is_live);
    // set up ff
    let mut mock_ff_client = db::tests::MockFFClient::new();
    let tenant_id = tenant.id.clone();
    mock_ff_client.mock(|c| {
        c.expect_flag()
            .withf(move |f| *f == BoolFlag::IsDemoTenant(&tenant_id))
            .times(1)
            .return_once(|_| true);
    });
    state.set_ff_client(mock_ff_client.into_mock());

    let res = utils::get_fixture_result(state.ff_client.clone(), &vault, &wf, &tenant.id).unwrap();
    assert!(res == Some(WorkflowFixtureResult::Pass)); // Fixture decision for demo tenant
}
