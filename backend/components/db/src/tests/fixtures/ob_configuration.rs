use crate::PgConn;
use newtypes::{CollectedDataOption, TenantId};

use crate::models::ob_configuration::ObConfiguration;

pub fn create(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> ObConfiguration {
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
        is_live,
    )
    .expect("Could not create ob config")
}
