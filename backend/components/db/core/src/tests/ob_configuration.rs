use macros::db_test;
use newtypes::ApiKeyStatus;

use super::fixtures;
use crate::tests::prelude::*;

use crate::models::ob_configuration::ObConfiguration;

#[db_test]
fn test_ob_config(conn: &mut TestPgConn) {
    // Create an ob config
    let tenant = fixtures::tenant::create(conn);
    let ob_config = fixtures::ob_configuration::create(conn, &tenant.id, true);

    // Enforce it exists
    let (fetched_ob_config, tenant) =
        ObConfiguration::get_enabled(conn, &ob_config.id).expect("Could not fetch");
    assert_eq!(ob_config.name, fetched_ob_config.name);

    // Mark as inactive
    ObConfiguration::update(
        conn,
        &ob_config.id,
        &tenant.id,
        true,
        None,
        Some(ApiKeyStatus::Disabled),
    )
    .expect("Couldn't update");

    // Enforce it does not exist
    ObConfiguration::get_enabled(conn, &ob_config.id).expect_err("Shouldn't find disabled ob config");
}
