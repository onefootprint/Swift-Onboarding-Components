use crate::PgConn;
use newtypes::{CollectedDataOption, TenantId};

use crate::models::ob_configuration::ObConfiguration;

pub fn create(conn: &mut PgConn, tenant_id: &TenantId) -> ObConfiguration {
    ObConfiguration::create(
        conn,
        "Flerp config".to_owned(),
        tenant_id.clone(),
        vec![CollectedDataOption::PhoneNumber],
        vec![CollectedDataOption::PhoneNumber],
        false,
        false,
        false,
        false,
        true,
    )
    .expect("Could not create ob config")
}
